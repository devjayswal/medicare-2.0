import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

@Component({
  selector: 'app-patient-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-login.html',
  styleUrls: ['./patient-login.css']
})
export class PatientLogin {
  loginData = {
    mobile: '',
    password: ''
  };

  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };

  isLogin = true;
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private api: Api
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginData.mobile || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.auth.patientLogin(this.loginData.mobile, this.loginData.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.successMessage = 'Login successful! Redirecting...';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/patient/dashboard']);
        }, 1500);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerData.fullName || !this.registerData.email || 
        !this.registerData.password || !this.registerData.mobile) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.api.registerPatient(this.registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Please login with your credentials.';
        this.loading = false;
        
        setTimeout(() => {
          this.isLogin = true;
          this.registerData = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            mobile: '',
            gender: 'Male',
            dateOfBirth: '',
            address: '',
            city: '',
            state: '',
            pincode: ''
          };
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
