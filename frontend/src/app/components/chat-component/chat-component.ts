// frontend/src/app/components/chat-component/chat-component.ts

import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessageDTO, TypingIndicatorDTO } from '../../services/chat-service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api';
import { Router, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styles: [`
    .chat-container { max-height: calc(100vh - 80px); }
    @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Added

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef; // Added for scrolling

  currentUserId = signal<number | null>(null);
  selectedUser = signal<any>(null);
  conversationMessages = signal<ChatMessageDTO[]>([]);
  chatContacts = signal<any[]>([]);
  messageInput = '';
  isSending = signal(false);
  hoveredMessageId = signal<number | null>(null);
  wsConnected = signal(false);
  isTyping = signal(false);
  unreadCount = signal(0);

  private typingTimeout: any;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user?.userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.currentUserId.set(user.userId);
    this.chatService.connect(user.userId);

    this.chatService.connectionStatus$.subscribe(status => {
      this.wsConnected.set(status);
    });

    this.chatService.messageReceived$.subscribe(message => {
      this.handleReceivedMessage(message);
    });

    this.chatService.typingIndicator$.subscribe(indicator => {
      if (indicator.userId === this.selectedUser()?.id && indicator.isTyping) {
        this.isTyping.set(true);
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.isTyping.set(false), 3000);
      }
    });

    this.loadChatContacts();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  loadChatContacts() {
    const userId = this.currentUserId();
    if (!userId) return;

    this.chatService.getChatUserIds(userId).subscribe({
      next: (userIds) => {
        const contacts: any[] = [];
        if (userIds.length === 0) {
          this.chatContacts.set([]);
          this.handleIncomingRecipient(); // Check if we need to start a new chat
          return;
        }

        userIds.forEach(id => {
          this.apiService.getUserById(id).subscribe({
            next: (user) => {
              contacts.push({
                id: user.id,
                name: user.name,
                avatar: user.avatarUrl,
                lastMessage: ''
              });
              if (contacts.length === userIds.length) {
                this.chatContacts.set(contacts);
                this.handleIncomingRecipient(); // Handle the "Contact User" redirect
              }
            }
          });
        });
      }
    });

    this.chatService.getUnreadMessages(userId).subscribe(msgs => this.unreadCount.set(msgs.length));
  }

  // New logic to handle the recipientId from Request Details
  private handleIncomingRecipient() {
    this.route.queryParams.subscribe(params => {
      const recipientId = params['recipientId'];
      if (recipientId) {
        const id = parseInt(recipientId);
        const existing = this.chatContacts().find(c => c.id === id);
        
        if (existing) {
          this.selectUser(existing);
        } else {
          // If the user isn't in the list yet, fetch their details to start the chat
          this.apiService.getUserById(id).subscribe(user => {
            const newContact = { id: user.id, name: user.name, avatar: user.avatarUrl, lastMessage: '' };
            this.chatContacts.update(list => [newContact, ...list]);
            this.selectUser(newContact);
          });
        }
      }
    });
  }

  selectUser(contact: any) {
    this.selectedUser.set(contact);
    this.isTyping.set(false);
    this.loadConversation();
    this.chatService.subscribeToMessages(this.currentUserId()!);
    this.chatService.subscribeToTypingIndicator(this.currentUserId()!);
  }

  loadConversation() {
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    if (!userId || !otherUserId) return;

    this.chatService.getConversation(userId, otherUserId).subscribe({
      next: (messages) => {
        this.conversationMessages.set(messages);
        messages.forEach(msg => {
          if (!msg.isRead && msg.recipientId === userId) {
            this.chatService.markAsRead(msg.id).subscribe();
          }
        });
        this.scrollToBottom();
      }
    });
  }

  sendMessage() {
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    if (!userId || !otherUserId || !this.messageInput.trim()) return;

    this.isSending.set(true);
    if (this.wsConnected()) {
      this.chatService.sendMessageViaWebSocket(userId, otherUserId, this.messageInput);
    } else {
      this.chatService.sendMessage(userId, otherUserId, this.messageInput).subscribe(msg => {
        this.conversationMessages.update(msgs => [...msgs, msg]);
        this.scrollToBottom();
      });
    }

    this.chatService.sendTypingIndicator(userId, otherUserId, false);
    this.messageInput = '';
    this.isSending.set(false);
    this.scrollToBottom();
  }

  onMessageInputChange() {
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    if (userId && otherUserId) {
      this.chatService.sendTypingIndicator(userId, otherUserId, true);
    }
  }

  deleteMessage(messageId: number) {
    if (confirm('Delete this message?')) {
      this.chatService.deleteMessage(messageId, this.currentUserId()!).subscribe(deletedMsg => {
        this.conversationMessages.update(msgs => 
          msgs.map(m => m.id === messageId ? deletedMsg : m)
        );
      });
    }
  }

  private handleReceivedMessage(message: ChatMessageDTO) {
    const otherUserId = this.selectedUser()?.id;
    if (message.senderId === otherUserId || message.recipientId === otherUserId) {
      this.conversationMessages.update(msgs => [...msgs, message]);
      if (message.recipientId === this.currentUserId()) {
        this.chatService.markAsRead(message.id).subscribe();
      }
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  goBack() {
    window.history.back(); // Changed to go back to the specific request if coming from there
  }
}