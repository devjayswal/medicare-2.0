import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements OnInit {
  patientName = '';
  upcomingAppointments = [
    { date: '2024-01-15', time: '10:00 AM', doctor: 'Dr. Smith', department: 'Cardiology', status: 'Confirmed' },
    { date: '2024-01-20', time: '2:30 PM', doctor: 'Dr. Johnson', department: 'Orthopedics', status: 'Pending' }
  ];
  
  recentRecords = [
    { date: '2024-01-05', type: 'Blood Test', doctor: 'Dr. Smith', status: 'Completed' },
    { date: '2024-01-03', type: 'X-Ray', doctor: 'Dr. Wilson', status: 'Completed' }
  ];

  quickStats = [
    { label: 'Total Appointments', value: '12', icon: '📅' },
    { label: 'Upcoming', value: '2', icon: '⏰' },
    { label: 'Medical Records', value: '8', icon: '📋' },
    { label: 'Prescriptions', value: '5', icon: '💊' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.patientName = this.authService.currentUserValue?.name || 'Patient';
  }
}
