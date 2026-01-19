import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-profile.html',
  styleUrls: ['./patient-profile.css']
})
export class PatientProfile implements OnInit {
  profileData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-15',
    address: '123 Main St, City, State',
    bloodGroup: 'O+',
    emergencyContact: '+1234567899'
  };

  isEditing = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.profileData.fullName = user.name;
      this.profileData.email = user.email;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSave() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.profileData.fullName || !this.profileData.email || !this.profileData.phone) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    // TODO: Implement actual API call
    console.log('Saving profile:', this.profileData);
    this.successMessage = 'Profile updated successfully!';
    this.isEditing = false;

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
