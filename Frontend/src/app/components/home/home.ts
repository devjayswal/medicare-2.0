import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  features = [
    {
      icon: '👥',
      title: 'Patient Management',
      description: 'Comprehensive patient registration, medical history, and appointment tracking'
    },
    {
      icon: '📅',
      title: 'Appointment Scheduling',
      description: 'Easy-to-use appointment booking system with automated reminders'
    },
    {
      icon: '💊',
      title: 'Prescription Management',
      description: 'Digital prescription system with medication tracking'
    },
    {
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'Detailed reports and insights for better hospital management'
    }
  ];
}
