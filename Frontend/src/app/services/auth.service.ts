import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser: Observable<any> = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  get isPatient(): boolean {
    return this.currentUserValue?.role === 'patient';
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  patientLogin(email: string, password: string) {
    // TODO: Replace with actual API call
    const user = {
      id: 1,
      name: 'John Doe',
      email: email,
      role: 'patient'
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  adminLogin(username: string, password: string) {
    // TODO: Replace with actual API call
    if (username === 'admin' && password === 'admin123') {
      const user = {
        id: 1,
        name: 'Admin User',
        username: username,
        role: 'admin'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return user;
    }
    return null;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
