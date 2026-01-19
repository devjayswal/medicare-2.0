import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-patient-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-register.html',
  styleUrl: './patient-register.css',
})
export class PatientRegister {
  formData = {
    fullName: '',
    mobile: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  };
  
  error = '';
  loading = false;

  constructor(private auth: Auth, private router: Router) {}

  onSubmit() {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';

    const { confirmPassword, ...registerData } = this.formData;

    this.auth.patientRegister(registerData).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/patient/login']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
