import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-appointments.html',
  styleUrls: ['./patient-appointments.css']
})
export class PatientAppointments implements OnInit {
  appointments: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private api: Api,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const patientId = this.auth.getPatientId();
    console.log('loadAppointments - patientId:', patientId);
    console.log('loadAppointments - currentUser:', this.auth.getCurrentUser());
    
    if (!patientId) {
      this.errorMessage = 'Please login to view your appointments';
      console.warn('No patient ID found, user must login');
      return;
    }

    this.errorMessage = '';
    this.loading = true;
    this.api.getPatientAppointments(patientId)
      .subscribe({
      next: (response) => {
        console.log('Appointments response:', response);

        try {
          // Handle both array and object responses
          const appointmentsList = Array.isArray(response) ? response : (response.data || []);

          this.appointments = appointmentsList.map((item: any) => {
            const appointmentDate = new Date(item.appointmentAt);
            const isValidDate = !isNaN(appointmentDate.getTime());

            const rawStatus = item.status || 'BOOKED';
            const friendlyStatus = this.formatStatus(rawStatus) || 'Confirmed';

            const dateStr = isValidDate
              ? appointmentDate.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '—';

            const timeStr = isValidDate
              ? appointmentDate.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : '—';

            return {
              id: item.id,
              date: dateStr,
              time: timeStr,
              doctor: item?.doctor?.fullName ?? 'N/A',
              department: item?.doctor?.specialty ?? 'N/A',
              status: friendlyStatus,
              rawStatus: rawStatus,
              appointmentAt: item.appointmentAt,
            };
          });

          console.log('Mapped appointments:', this.appointments);
          this.loading = false;
          this.cdr.detectChanges();
        } catch (mapErr) {
          console.error('Error mapping appointments:', mapErr);
          this.errorMessage = 'Failed to render appointments. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'BOOKED': return 'Confirmed';
      case 'CANCELLED': return 'Cancelled';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  }

  cancelAppointment(id: string) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.api.cancelAppointment(id).subscribe({
        next: (response) => {
          console.log('Appointment cancelled:', response);
          // Reload appointments to reflect the change
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error cancelling appointment:', error);
          this.errorMessage = 'Failed to cancel appointment. Please try again.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }
}
