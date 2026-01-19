import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLogin {
  loginData = {
    email: '',
    password: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;

    this.auth.adminLogin(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (response: any) => {
          this.successMessage = 'Login successful! Redirecting to dashboard...';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1000);
        },
        error: (error: any) => {
          this.errorMessage = error?.error?.message || 'Invalid credentials. Please try again.';
          this.isLoading = false;
        }
      });
  }
}
