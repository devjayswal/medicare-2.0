import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://localhost:5007/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getDoctors(page: number = 1, pageSize: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors?page=${page}&pageSize=${pageSize}`);
  }

  getDoctorSlots(doctorId: string, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/${doctorId}/slots?date=${date}`);
  }

  getPatientAppointments(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/patients/${patientId}/appointments`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/book`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  cancelAppointment(appointmentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/${appointmentId}/cancel`, {}, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  rescheduleAppointment(appointmentId: string, newAppointmentAt: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/${appointmentId}/reschedule`, 
      { newAppointmentAt }, 
      {
        headers: this.getHeaders(),
        withCredentials: true
      });
  }

  // Admin endpoints
  getAllAppointments(status?: string, page: number = 1, pageSize: number = 20): Observable<any> {
    let url = `${this.apiUrl}/admin/appointments?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    return this.http.get(url, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  updateAppointmentStatus(appointmentId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/appointments/${appointmentId}/status`, 
      { status }, 
      {
        headers: this.getHeaders(),
        withCredentials: true
      });
  }

  getAllPatients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/patients/list`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  registerPatient(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients/register`, data);
  }
}

