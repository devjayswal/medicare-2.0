import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.html',
  styleUrls: ['./book-appointment.css']
})
export class BookAppointment implements OnInit {
  appointmentData = {
    doctorId: '',
    date: '',
    time: ''
  };

  doctors: any[] = [];
  timeSlots: string[] = [];
  filteredDoctors: any[] = [];
  departments: string[] = [];
  selectedDepartment: string = '';
  
  successMessage = '';
  errorMessage = '';
  loading = false;
  loadingSlots = false;

  constructor(
    private router: Router,
    private api: Api,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    console.log('Starting to load doctors...');
    this.api.getDoctors().subscribe({
      next: (response) => {
        console.log('getDoctors response:', response);
        // Handle new pagination format { data: [...], totalCount, pageCount, ... }
        const doctorsList = Array.isArray(response) ? response : response.data || [];
        console.log('doctorsList:', doctorsList);
        console.log('doctorsList.length:', doctorsList.length);
        
        this.doctors = doctorsList;
        this.filteredDoctors = doctorsList;
        
        // Extract unique departments (using 'specialty' field)
        this.departments = [...new Set(this.doctors.map(d => d.specialty))];
        console.log('departments:', this.departments);
        
        this.loading = false;
        console.log('loading set to false');
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.errorMessage = 'Failed to load doctors. Please refresh the page.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDepartmentChange() {
    if (this.selectedDepartment) {
      this.filteredDoctors = this.doctors.filter(d => d.specialty === this.selectedDepartment);
    } else {
      this.filteredDoctors = this.doctors;
    }
    // Reset doctor and time selection when department changes
    this.appointmentData.doctorId = '';
    this.appointmentData.time = '';
    this.timeSlots = [];
  }

  onDoctorChange() {
    // Reset time and slots when doctor changes
    this.appointmentData.time = '';
    this.timeSlots = [];
    
    // Load slots if date is already selected
    if (this.appointmentData.date && this.appointmentData.doctorId) {
      this.loadTimeSlots();
    }
  }

  onDateChange() {
    // Reset time selection when date changes
    this.appointmentData.time = '';
    
    // Load slots if doctor is selected
    if (this.appointmentData.doctorId && this.appointmentData.date) {
      this.loadTimeSlots();
    }
  }

  loadTimeSlots() {
    if (!this.appointmentData.doctorId || !this.appointmentData.date) {
      return;
    }

    this.loadingSlots = true;
    this.timeSlots = [];
    
    this.api.getDoctorSlots(this.appointmentData.doctorId, this.appointmentData.date).subscribe({
      next: (slots) => {
        this.timeSlots = slots;
        this.loadingSlots = false;
        if (this.timeSlots.length === 0) {
          this.errorMessage = 'No available slots for this date. Please try another date.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.errorMessage = 'Failed to load available time slots.';
        this.loadingSlots = false;
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.appointmentData.doctorId || !this.appointmentData.date || !this.appointmentData.time) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    // Get patient ID from auth service
    const patientId = this.auth.getPatientId();
    if (!patientId) {
      this.errorMessage = 'Please login to book an appointment';
      setTimeout(() => {
        this.router.navigate(['/patient/login']);
      }, 2000);
      return;
    }

    // Combine date and time into a DateTime object
    const [hours, minutes] = this.appointmentData.time.split(':');
    const appointmentDateTime = new Date(this.appointmentData.date);
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const bookingData = {
      patientId: patientId,
      doctorId: this.appointmentData.doctorId,
      appointmentAt: appointmentDateTime.toISOString()
    };

    this.loading = true;
    this.api.bookAppointment(bookingData).subscribe({
      next: (response) => {
        console.log('Appointment booked successfully:', response);
        this.successMessage = 'Appointment booked successfully!';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/patient/appointments']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error booking appointment:', error);
        this.errorMessage = error.error?.message || 'Failed to book appointment. Please try again.';
        this.loading = false;
      }
    });
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
