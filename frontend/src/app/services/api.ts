// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
  token: string;
  message: string;
}

export interface ServiceRequestDTO {
  id?: number;
  title: string;
  category: string;
  description: string;
  budget: string;
  location: string;
  date: string;
  time: string;
  userId?: number;
  userName?: string;
  userAvatar?: string;
  userRating?: number;
  status?: string;
  urgent?: boolean;
  distance?: string;
  timeAgo?: string;
}

export interface UserStatsDTO {
  completedTasks: number;
  thisMonth: number;
  activeClients: number;
  avgRating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Get headers with user ID
  private getHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Id': userId || ''
    });
  }

  // Auth endpoints
  register(data: RegisterRequest): Observable<AuthResponse> {
    console.log(data);
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data);
  }

  // User endpoints
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  getUserStats(id: number): Observable<UserStatsDTO> {
    return this.http.get<UserStatsDTO>(`${this.baseUrl}/users/${id}/stats`);
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  // Service Request endpoints
  getAllOpenRequests(): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests`);
  }

  getRequestById(id: number): Observable<ServiceRequestDTO> {
    return this.http.get<ServiceRequestDTO>(`${this.baseUrl}/requests/${id}`);
  }

  getRequestsByUser(userId: number): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests/user/${userId}`);
  }

  createRequest(data: ServiceRequestDTO): Observable<ServiceRequestDTO> {
    return this.http.post<ServiceRequestDTO>(
      `${this.baseUrl}/requests`,
      data,
      { headers: this.getHeaders() }
    );
  }

  acceptRequest(requestId: number): Observable<ServiceRequestDTO> {
    return this.http.post<ServiceRequestDTO>(
      `${this.baseUrl}/requests/${requestId}/accept`,
      {},
      { headers: this.getHeaders() }
    );
  }

  completeRequest(requestId: number): Observable<ServiceRequestDTO> {
    return this.http.post<ServiceRequestDTO>(
      `${this.baseUrl}/requests/${requestId}/complete`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Review endpoints
  createReview(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/reviews`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getRequestsByCategory(category: string): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests/category/${category}`);
  }

  cancelRequest(requestId: number): Observable<ServiceRequestDTO> {
    return this.http.post<ServiceRequestDTO>(
      `${this.baseUrl}/requests/${requestId}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getCompletedRequestsByUser(userId: number): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests/user/${userId}/completed`);
  }

  getInProgressRequestsByUser(userId: number): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests/user/${userId}/in-progress`);
  }

  // Tasks where user is the HELPER
  getAcceptedTasksByHelper(helperId: number): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests/helper/${helperId}/accepted`);
  }

  getCompletedTasksByHelper(helperId: number): Observable<ServiceRequestDTO[]> {
    return this.http.get<ServiceRequestDTO[]>(`${this.baseUrl}/requests/helper/${helperId}/completed`);
  }

  uploadAvatar(userId: number, avatarUrl: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/users/${userId}/avatar`,
      { avatarUrl },
      { headers: this.getHeaders() }
    );
  }
}

export class Api {
}
