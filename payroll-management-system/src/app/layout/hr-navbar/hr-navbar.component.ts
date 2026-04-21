import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-hr-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-navbar.component.html',
  styleUrls: ['./hr-navbar.component.css']
})
export class HrNavbarComponent {
  private authService = inject(AuthService);
  name  = this.authService.getName()  ?? 'HR User';
  email = this.authService.getEmail() ?? '';
  initials = this.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'HR';

  logout() { this.authService.logout(); }
}