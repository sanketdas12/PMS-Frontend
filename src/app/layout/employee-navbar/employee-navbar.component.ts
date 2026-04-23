import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-employee-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './employee-navbar.component.html',
  styleUrls: ['./employee-navbar.component.css']
})
export class EmployeeNavbarComponent {
  private authService = inject(AuthService);
  name     = this.authService.getName()  ?? 'Employee';
  email    = this.authService.getEmail() ?? '';

  navItems = [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'My Payslip', path: '/employee/payslip' },
    { label: 'My Profile', path: '/employee/profile' },
  ];

  logout() { this.authService.logout(); }
}
