import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:5007/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  patientRegister(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients/register`, data);
  }

  patientLogin(mobile: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients/login`, { mobile, password }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          if (response.patient && this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(response.patient));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.patient);
          }
        })
      );
  }

  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          if (response.admin && this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(response.admin));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.admin);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getPatientId(): string | null {
    const user = this.getCurrentUser();
    const id = user?.id || null;
    
    console.log('getPatientId - currentUser:', user);
    console.log('getPatientId - id:', id);
    
    // Validate that ID is a valid MongoDB ObjectId (24 character hex string)
    if (id && /^[0-9a-f]{24}$/i.test(id)) {
      console.log('getPatientId - valid ID:', id);
      return id;
    }
    
    console.log('getPatientId - invalid ID format');
    return null;
  }
}

