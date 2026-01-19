import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/home/home').then(m => m.Home) },
  { path: 'patients/login', loadComponent: () => import('./components/patient-login/patient-login').then(m => m.PatientLogin) },
  { path: 'admin/login', loadComponent: () => import('./components/admin-login/admin-login').then(m => m.AdminLogin) },
  
  // Patient Routes
  { path: 'patient/dashboard', loadComponent: () => import('./components/patient-dashboard/patient-dashboard').then(m => m.PatientDashboard) },
  { path: 'patient/book-appointment', loadComponent: () => import('./components/book-appointment/book-appointment').then(m => m.BookAppointment) },
  { path: 'patient/appointments', loadComponent: () => import('./components/patient-appointments/patient-appointments').then(m => m.PatientAppointments) },
  { path: 'patient/profile', loadComponent: () => import('./components/patient-profile/patient-profile').then(m => m.PatientProfile) },
  
  // Admin Routes
  { path: 'admin/dashboard', loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
  
  { path: '**', redirectTo: '' }
];
