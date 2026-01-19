import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  appointments: any[] = [];
  filterStatus = '';
  loading = true;
  error = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  pageCount = 0;
  
  // Caching
  private appointmentCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  stats = [
    { label: 'Total Patients', value: '1,234', icon: '👥', color: '#3498db' },
    { label: 'Today\'s Appointments', value: '48', icon: '📅', color: '#2ecc71' },
    { label: 'Available Doctors', value: '24', icon: '👨‍⚕️', color: '#9b59b6' },
    { label: 'Pending Requests', value: '12', icon: '⏳', color: '#e67e22' }
  ];

  recentAppointments = [
    { patient: 'John Doe', doctor: 'Dr. Smith', time: '10:00 AM', status: 'Confirmed' },
    { patient: 'Jane Smith', doctor: 'Dr. Johnson', time: '11:30 AM', status: 'Pending' },
    { patient: 'Mike Brown', doctor: 'Dr. Williams', time: '2:00 PM', status: 'Confirmed' }
  ];

  constructor(private auth: Auth, private api: Api, private router: Router) {}

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    const cacheKey = `${this.filterStatus}-${this.currentPage}`;
    
    // Check cache first
    const cached = this.appointmentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      this.appointments = cached.data.data;
      this.totalCount = cached.data.totalCount;
      this.pageCount = cached.data.pageCount;
      this.loading = false;
      return;
    }

    this.api.getAllAppointments(this.filterStatus || undefined, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.appointments = response.data;
        this.totalCount = response.totalCount;
        this.pageCount = response.pageCount;
        
        // Cache the result
        this.appointmentCache.set(cacheKey, { data: response, timestamp: Date.now() });
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load appointments';
        this.loading = false;
      }
    });
  }

  updateStatus(appointmentId: string, status: string) {
    this.api.updateAppointmentStatus(appointmentId, status).subscribe({
      next: () => {
        alert('Status updated successfully');
        this.appointmentCache.clear(); // Clear cache after update
        this.currentPage = 1;
        this.loadAppointments();
      },
      error: (err) => {
        alert('Failed to update status');
      }
    });
  }

  nextPage() {
    if (this.currentPage < this.pageCount) {
      this.currentPage++;
      this.loadAppointments();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAppointments();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.pageCount) {
      this.currentPage = page;
      this.loadAppointments();
    }
  }

  onFilterChange() {
    this.currentPage = 1; // Reset to first page when filter changes
    this.loadAppointments();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
