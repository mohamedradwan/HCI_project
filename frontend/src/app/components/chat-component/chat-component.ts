// styles: [`
//   /* FIXED: Chat now takes full screen height without empty gaps */
//   .chat-container { height: 100vh; border-radius: 0; }
//   @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
// `]
import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessageDTO } from '../../services/chat-service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api';
import { Router, ActivatedRoute } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './chat-component.html',
  styles: [`
    .chat-container { height: 100%; }
    @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  currentUserId = signal<number | null>(null);
  selectedUser = signal<any>(null);
  conversationMessages = signal<ChatMessageDTO[]>([]);
  chatContacts = signal<any[]>([]);
  messageInput = '';
  isSending = signal(false);
  wsConnected = signal(false);
  isTyping = signal(false);
  unreadCount = signal(0);
  hoveredMessageId = signal<number | null>(null);

  private typingTimeout: any;
  private refreshInterval: any;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user?.userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.currentUserId.set(Number(user.userId));
    this.chatService.connect(user.userId);

    this.chatService.connectionStatus$.subscribe(status => this.wsConnected.set(status));
    this.chatService.messageReceived$.subscribe(msg => this.handleReceivedMessage(msg));

    this.chatService.typingIndicator$.subscribe(indicator => {
      if (indicator.userId === this.selectedUser()?.id && indicator.isTyping) {
        this.isTyping.set(true);
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.isTyping.set(false), 3000);
      }
    });

    // CRITICAL FIX: Load chat contacts first, then handle recipient after a delay
    // This ensures the sidebar is populated before selecting a user
    this.loadChatContacts();

    // Wait for contacts to load before handling the incoming recipient
    setTimeout(() => {
      this.handleIncomingRecipient();
      this.addDummyData(); // Add dummy data for demonstration
    }, 500);
  }

  private addDummyData() {
    if (this.chatContacts().length === 0) {
      const dummyContacts = [
        { id: 101, name: 'Dexter Morgan', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: 'Thanks for the recommendation!', lastMessageTime: new Date(Date.now() - 3600000).toISOString() },
        { id: 102, name: 'Jesse Pinkman', avatar: 'https://i.pravatar.cc/150?img=33', lastMessage: 'Yo, that was really helpful!', lastMessageTime: new Date(Date.now() - 7200000).toISOString() },
        { id: 103, name: 'Elliot Alderson', avatar: 'https://i.pravatar.cc/150?img=57', lastMessage: 'I will check the security protocols.', lastMessageTime: new Date(Date.now() - 86400000).toISOString() }
      ];
      this.chatContacts.set(dummyContacts);

      // Select the first dummy user and add some messages
      this.selectedUser.set(dummyContacts[0]);
      const dummyMessages: ChatMessageDTO[] = [
        { id: 1, senderId: 101, senderName: 'Dexter Morgan', recipientId: this.currentUserId()!, recipientName: 'Me', content: 'Hi, I saw your profile. Are you available for the therapy sessions?', isRead: true, isDeleted: false, createdAt: new Date(Date.now() - 4000000).toISOString(), updatedAt: new Date(Date.now() - 4000000).toISOString() },
        { id: 2, senderId: this.currentUserId()!, senderName: 'Me', recipientId: 101, recipientName: 'Dexter Morgan', content: 'Yes, I have availability in the evenings. What time works best for you?', isRead: true, isDeleted: false, createdAt: new Date(Date.now() - 3800000).toISOString(), updatedAt: new Date(Date.now() - 3800000).toISOString() },
        { id: 3, senderId: 101, senderName: 'Dexter Morgan', recipientId: this.currentUserId()!, recipientName: 'Me', content: 'Thanks for the recommendation!', isRead: true, isDeleted: false, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() }
      ];
      this.conversationMessages.set(dummyMessages);
      this.scrollToBottom();
    }
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  // FIXED: Load contacts reliably using forkJoin to batch requests
  loadChatContacts() {
    const userId = this.currentUserId();
    if (!userId) return;

    this.chatService.getUnreadMessages(userId).subscribe(msgs =>
      this.unreadCount.set(msgs.length)
    );

    this.chatService.getChatUserIds(userId).subscribe({
      next: (userIds) => {
        console.log('📧 Chat User IDs received:', userIds); // DEBUG
        if (!userIds || userIds.length === 0) {
          console.warn('⚠️ No chat user IDs returned');
          return;
        }
        console.log(`✅ Loading ${userIds.length} chat contacts...`); // DEBUG

        // Prepare requests for all users
        const requests = userIds.map(id =>
          this.apiService.getUserById(id).pipe(
            catchError(err => {
              console.warn(`Failed to load user ${id}`, err);
              return of(null);
            })
          )
        );

        // Fetch all users in parallel and update the list once
        forkJoin(requests).subscribe(users => {
          const newContacts: any[] = [];

          users.forEach(user => {
            if (user) {
              newContacts.push({
                id: user.id,
                name: user.name,
                avatar: user.avatarUrl,
                lastMessage: '',
                lastMessageTime: new Date().toISOString() // Will be updated with real message time
              });
            }
          });

          console.log('👥 Loaded contacts:', newContacts); // DEBUG

          // Update signal safely, avoiding duplicates if recipient was already added
          if (newContacts.length > 0) {
            this.chatContacts.update(currentList => {
              const existingIds = new Set(currentList.map(c => c.id));
              const toAdd = newContacts.filter(c => !existingIds.has(c.id));
              const finalList = [...currentList, ...toAdd];
              console.log('📋 Final chat contacts list:', finalList); // DEBUG
              return finalList;
            });
          }
        });
      },
      error: (err) => console.error('Failed to load chat history IDs', err)
    });
  }

  private handleIncomingRecipient() {
    this.route.queryParams.subscribe(params => {
      const recipientId = params['recipientId'];
      if (recipientId) {
        const id = parseInt(recipientId);
        console.log('🔍 Handling incoming recipient:', id); // DEBUG
        console.log('📋 Current chat contacts:', this.chatContacts()); // DEBUG

        // Check if already in list (might have loaded from history)
        const existing = this.chatContacts().find(c => c.id === id);
        if (existing) {
          console.log('✅ Recipient found in existing contacts'); // DEBUG
          this.selectUser(existing);
          return;
        }

        console.log('⚠️ Recipient not in contacts, fetching user data...'); // DEBUG
        // Fetch explicitly
        this.apiService.getUserById(id).subscribe({
          next: (user) => {
            const newContact = {
              id: user.id,
              name: user.name,
              avatar: user.avatarUrl,
              lastMessage: 'New Chat'
            };
            console.log('➕ Adding new contact:', newContact); // DEBUG
            this.addContactToList(newContact);
            this.selectUser(newContact);
          },
          error: (err) => console.error('Could not load recipient', err)
        });
      }
    });
  }

  // Helper to add contacts safely without duplicates
  private addContactToList(contact: any) {
    this.chatContacts.update(currentList => {
      // If already exists, don't add again
      if (currentList.find(c => c.id === contact.id)) {
        return currentList;
      }
      return [...currentList, contact];
    });
  }

  selectUser(contact: any) {
    if (this.selectedUser()?.id === contact.id) return;

    this.selectedUser.set(contact);
    this.isTyping.set(false);
    this.loadConversation();

    this.chatService.subscribeToMessages(this.currentUserId()!);
    this.chatService.subscribeToTypingIndicator(this.currentUserId()!);

    // AUTO-REFRESH: Reload messages every 5 seconds
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      if (this.selectedUser()) {
        this.loadConversation();
      }
    }, 5000);
  }

  loadConversation() {
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    if (!userId || !otherUserId) return;

    this.chatService.getConversation(userId, otherUserId).subscribe({
      next: (messages) => {
        const safeMessages = messages.map(msg => ({
          ...msg,
          senderId: Number(msg.senderId),
          recipientId: Number(msg.recipientId)
        }));

        this.conversationMessages.set(safeMessages);

        safeMessages.forEach(msg => {
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

    const content = this.messageInput;
    this.messageInput = '';
    this.isSending.set(true);

    const tempMessage: ChatMessageDTO = {
      id: Date.now(),
      senderId: userId,
      senderName: 'Me',
      recipientId: otherUserId,
      recipientName: this.selectedUser().name,
      content: content,
      isRead: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversationMessages.update(msgs => [...msgs, tempMessage]);
    this.scrollToBottom();

    if (this.wsConnected()) {
      this.chatService.sendMessageViaWebSocket(userId, otherUserId, content);
      this.isSending.set(false);
    } else {
      this.chatService.sendMessage(userId, otherUserId, content).subscribe({
        next: () => this.isSending.set(false),
        error: () => {
          this.isSending.set(false);
          this.messageInput = content;
          alert('Message failed to send');
        }
      });
    }
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
    const currentUserId = this.currentUserId();
    const msgSenderId = Number(message.senderId);
    const msgRecipientId = Number(message.recipientId);

    if (msgSenderId === currentUserId) return;

    if (msgSenderId === otherUserId || msgRecipientId === otherUserId) {
      const safeMessage = { ...message, senderId: msgSenderId, recipientId: msgRecipientId };
      this.conversationMessages.update(msgs => [...msgs, safeMessage]);

      if (msgRecipientId === currentUserId) {
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
    window.history.back();
  }
}