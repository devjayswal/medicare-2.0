import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  isPatient = false;
  isAdmin = false;
  userName = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isPatient = this.authService.isPatient;
      this.isAdmin = this.authService.isAdmin;
      this.userName = user?.name || user?.username || '';
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
