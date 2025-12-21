import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export interface ChatMessageDTO {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  recipientId: number;
  recipientName: string;
  content: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicatorDTO {
  userId: number;
  userName: string;
  recipientId: number;
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8080/api/chat';
  private wsUrl = 'http://localhost:8080/ws-chat';
  
  stompClient: Client | null = null;
  isConnected = signal(false);
  
  // Subjects for real-time updates
  messageReceived$ = new Subject<ChatMessageDTO>();
  typingIndicator$ = new Subject<TypingIndicatorDTO>();
  connectionStatus$ = new Subject<boolean>();

  constructor(private http: HttpClient) { }

  // REST API endpoints
  sendMessage(senderId: number, recipientId: number, content: string): Observable<ChatMessageDTO> {
    return this.http.post<ChatMessageDTO>(
      `${this.baseUrl}/send?senderId=${senderId}&recipientId=${recipientId}`,
      { content }
    );
  }

  getConversation(userId: number, otherUserId: number): Observable<ChatMessageDTO[]> {
    return this.http.get<ChatMessageDTO[]>(
      `${this.baseUrl}/conversation?userId=${userId}&otherUserId=${otherUserId}`
    );
  }

  getUnreadMessages(userId: number): Observable<ChatMessageDTO[]> {
    return this.http.get<ChatMessageDTO[]>(`${this.baseUrl}/unread/${userId}`);
  }

  markAsRead(messageId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/mark-read/${messageId}`, {});
  }

  deleteMessage(messageId: number, userId: number): Observable<ChatMessageDTO> {
    return this.http.delete<ChatMessageDTO>(
      `${this.baseUrl}/delete/${messageId}?userId=${userId}`
    );
  }

  getChatUserIds(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/chat-users/${userId}`);
  }

  // WebSocket methods
  connect(userId: number): void {
    if (this.stompClient && this.stompClient.active) return;

    const socket = new SockJS(this.wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
      connectHeaders: {
        userId: userId.toString()
      },
      onConnect: () => {
        this.isConnected.set(true);
        this.connectionStatus$.next(true);
        console.log('WebSocket connected');
      },
      onStompError: (frame) => {
        this.isConnected.set(false);
        this.connectionStatus$.next(false);
        console.error('STOMP error', frame);
      },
      onWebSocketClose: () => {
        this.isConnected.set(false);
        this.connectionStatus$.next(false);
        console.log('WebSocket closed');
      }
    });

    this.stompClient.activate();
  }

  subscribeToMessages(recipientId: number): void {
    if (!this.stompClient || !this.stompClient.active) {
      console.warn('WebSocket not connected');
      return;
    }

    this.stompClient.subscribe(
      `/topic/messages/${recipientId}`,
      message => {
        const chatMessage = JSON.parse(message.body);
        this.messageReceived$.next(chatMessage);
      }
    );
  }

  subscribeToTypingIndicator(recipientId: number): void {
    if (!this.stompClient || !this.stompClient.active) {
      console.warn('WebSocket not connected');
      return;
    }

    this.stompClient.subscribe(
      `/topic/typing/${recipientId}`,
      message => {
        const typingIndicator = JSON.parse(message.body);
        this.typingIndicator$.next(typingIndicator);
      }
    );
  }

  sendMessageViaWebSocket(senderId: number, recipientId: number, content: string): void {
    if (!this.stompClient || !this.stompClient.active) {
      console.warn('WebSocket not connected, using REST API');
      this.sendMessage(senderId, recipientId, content).subscribe();
      return;
    }

    const message = { senderId, content };

    this.stompClient.publish({
      destination: `/app/chat/${recipientId}`,
      body: JSON.stringify(message)
    });
  }

  sendTypingIndicator(userId: number, recipientId: number, isTyping: boolean): void {
    if (!this.stompClient || !this.stompClient.active) return;

    const indicator = { userId, isTyping };

    this.stompClient.publish({
      destination: `/app/chat/${recipientId}/typing`,
      body: JSON.stringify(indicator)
    });
  }

  deleteMessageViaWebSocket(senderId: number, recipientId: number, messageId: number): void {
    if (!this.stompClient || !this.stompClient.active) {
      console.warn('WebSocket not connected, using REST API');
      this.deleteMessage(messageId, senderId).subscribe();
      return;
    }

    const message = { senderId };

    this.stompClient.publish({
      destination: `/app/chat/${recipientId}/delete/${messageId}`,
      body: JSON.stringify(message)
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected.set(false);
      this.connectionStatus$.next(false);
      console.log('WebSocket disconnected');
    }
  }
}
