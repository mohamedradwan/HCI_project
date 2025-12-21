import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessageDTO, TypingIndicatorDTO } from '../../services/chat-service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container bg-white rounded-lg shadow-lg h-screen flex flex-col">
      <!-- Header -->
      <div class="chat-header bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="text-white hover:bg-blue-700 p-2 rounded transition">
            ← Back
          </button>
          <div *ngIf="selectedUser()" class="flex items-center gap-2">
            <img [src]="selectedUser()?.avatar || 'https://i.pravatar.cc/150'" 
                 alt="User" class="w-10 h-10 rounded-full">
            <div>
              <h2 class="font-bold">{{ selectedUser()?.name }}</h2>
              <p class="text-xs opacity-80">
                <span *ngIf="wsConnected()">🟢 Online</span>
                <span *ngIf="!wsConnected()">🔴 Offline (using fallback)</span>
              </p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <span *ngIf="unreadCount() > 0" class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {{ unreadCount() }} unread
          </span>
        </div>
      </div>

      <!-- Chat List or Messages -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Contacts List -->
        <div class="w-64 border-r border-gray-300 overflow-y-auto bg-gray-50">
          <div class="p-4">
            <h3 class="font-bold mb-3 text-gray-700">Messages</h3>
            <div *ngIf="!selectedUser()" class="text-gray-500 text-sm">Select a contact to start chatting</div>
            
            <div *ngFor="let contact of chatContacts()" 
                 (click)="selectUser(contact)"
                 [class.bg-blue-100]="selectedUser()?.id === contact.id"
                 class="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition">
              <div class="flex items-center gap-2">
                <img [src]="contact.avatar || 'https://i.pravatar.cc/150'" 
                     alt="{{ contact.name }}" class="w-8 h-8 rounded-full">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{{ contact.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ contact.lastMessage || 'No messages yet' }}</p>
                </div>
              </div>
            </div>

            <div *ngIf="chatContacts().length === 0" class="text-gray-400 text-sm text-center py-4">
              No conversations yet
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 flex flex-col">
          <!-- Messages Display -->
          <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
            <div *ngIf="!selectedUser()" class="flex items-center justify-center h-full text-gray-500">
              <p>Select a contact to view conversation</p>
            </div>

            <div *ngIf="selectedUser()">
              <div *ngFor="let msg of conversationMessages()" 
                   [class.ml-auto]="msg.senderId === currentUserId()"
                   [class.mr-auto]="msg.senderId !== currentUserId()"
                   class="max-w-xs w-fit"
                   (mouseenter)="hoveredMessageId.set(msg.id)"
                   (mouseleave)="hoveredMessageId.set(null)">
                
                <div [class.bg-blue-500]="msg.senderId === currentUserId()"
                     [class.bg-gray-300]="msg.senderId !== currentUserId()"
                     [class.text-white]="msg.senderId === currentUserId()"
                     [class.opacity-60]="msg.isDeleted"
                     class="px-4 py-2 rounded-lg break-words relative group">
                  
                  <div *ngIf="msg.isDeleted" class="italic text-sm">Message deleted</div>
                  <div *ngIf="!msg.isDeleted">{{ msg.content }}</div>
                  
                  <!-- Message Time -->
                  <div [class.text-blue-100]="msg.senderId === currentUserId()"
                       [class.text-gray-600]="msg.senderId !== currentUserId()"
                       class="text-xs mt-1 flex justify-between items-center">
                    <span>{{ formatTime(msg.createdAt) }}</span>
                    <span *ngIf="msg.senderId === currentUserId() && msg.isRead" class="ml-1">✓✓</span>
                  </div>

                  <!-- Delete Button -->
                  <button *ngIf="msg.senderId === currentUserId() && !msg.isDeleted && hoveredMessageId() === msg.id"
                          (click)="deleteMessage(msg.id)"
                          class="absolute -right-8 top-0 text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition"
                          title="Delete message">
                    ✕
                  </button>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div *ngIf="isTyping()" class="flex items-center gap-2 text-gray-500 text-sm">
                <span>{{ selectedUser()?.name }} is typing</span>
                <span class="flex gap-1">
                  <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                  <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                </span>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div *ngIf="selectedUser()" class="border-t border-gray-300 p-4 bg-white">
            <div class="flex gap-2">
              <input type="text" 
                     [(ngModel)]="messageInput"
                     (keyup.enter)="sendMessage()"
                     (input)="onMessageInputChange()"
                     placeholder="Type a message..."
                     class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button (click)="sendMessage()"
                      [disabled]="!messageInput.trim() || isSending()"
                      class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold">
                {{ isSending() ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      max-height: calc(100vh - 80px);
    }
    @keyframes bounce {
      0%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-8px);
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

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
  private messagesContainer: any;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user?.userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.currentUserId.set(user.userId);
    
    // Connect to WebSocket
    this.chatService.connect(user.userId);
    
    // Monitor WebSocket connection
    this.chatService.connectionStatus$.subscribe(status => {
      this.wsConnected.set(status);
    });
    
    // Subscribe to incoming messages
    this.chatService.messageReceived$.subscribe(message => {
      this.handleReceivedMessage(message);
    });
    
    // Subscribe to typing indicators
    this.chatService.typingIndicator$.subscribe(indicator => {
      if (indicator.userId !== this.currentUserId() && indicator.isTyping) {
        this.isTyping.set(true);
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.isTyping.set(false), 3000);
      }
    });
    
    this.loadChatContacts();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  loadChatContacts() {
    const userId = this.currentUserId();
    if (!userId) return;

    this.chatService.getChatUserIds(userId).subscribe({
      next: (userIds) => {
        const contacts: any[] = [];
        let loaded = 0;
        
        userIds.forEach(id => {
          this.apiService.getUserById(id).subscribe({
            next: (user) => {
              contacts.push({
                id: user.id,
                name: user.name,
                avatar: user.avatarUrl,
                lastMessage: 'Loading...'
              });
              loaded++;
              if (loaded === userIds.length) {
                this.chatContacts.set(contacts);
              }
            }
          });
        });
        
        if (userIds.length === 0) {
          this.chatContacts.set([]);
        }
      }
    });

    // Load unread messages count
    this.chatService.getUnreadMessages(userId).subscribe({
      next: (messages) => {
        this.unreadCount.set(messages.length);
      }
    });
  }

  selectUser(contact: any) {
    this.selectedUser.set(contact);
    this.isTyping.set(false);
    this.loadConversation();
    
    // Subscribe to messages for this conversation
    this.chatService.subscribeToMessages(contact.id);
    this.chatService.subscribeToTypingIndicator(this.currentUserId()!);
  }

  loadConversation() {
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    
    if (!userId || !otherUserId) return;

    this.chatService.getConversation(userId, otherUserId).subscribe({
      next: (messages) => {
        this.conversationMessages.set(messages);
        
        // Mark unread messages as read
        messages.forEach(msg => {
          if (!msg.isRead && msg.recipientId === userId) {
            this.chatService.markAsRead(msg.id).subscribe();
          }
        });
        
        // Scroll to bottom
        setTimeout(() => this.scrollToBottom());
      }
    });
  }

  sendMessage() {
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    
    if (!userId || !otherUserId || !this.messageInput.trim()) return;

    this.isSending.set(true);
    
    // Send via WebSocket if connected, otherwise use REST API
    if (this.wsConnected()) {
      this.chatService.sendMessageViaWebSocket(userId, otherUserId, this.messageInput);
    } else {
      this.chatService.sendMessage(userId, otherUserId, this.messageInput).subscribe({
        next: (message) => {
          this.conversationMessages.update(msgs => [...msgs, message]);
          this.isSending.set(false);
          this.messageInput = '';
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.isSending.set(false);
        }
      });
    }

    // Send typing stop indicator
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
    const userId = this.currentUserId();
    const otherUserId = this.selectedUser()?.id;
    
    if (!userId || !otherUserId) return;

    if (confirm('Delete this message?')) {
      if (this.wsConnected()) {
        this.chatService.deleteMessageViaWebSocket(userId, otherUserId, messageId);
      } else {
        this.chatService.deleteMessage(messageId, userId).subscribe({
          next: (deletedMessage) => {
            this.conversationMessages.update(msgs =>
              msgs.map(m => m.id === messageId ? deletedMessage : m)
            );
          }
        });
      }
    }
  }

  private handleReceivedMessage(message: ChatMessageDTO) {
    const otherUserId = this.selectedUser()?.id;
    
    if (message.senderId === otherUserId || message.recipientId === otherUserId) {
      this.conversationMessages.update(msgs => [...msgs, message]);
      
      // Mark as read if we're the recipient
      if (message.recipientId === this.currentUserId()) {
        this.chatService.markAsRead(message.id).subscribe();
      }
      
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}