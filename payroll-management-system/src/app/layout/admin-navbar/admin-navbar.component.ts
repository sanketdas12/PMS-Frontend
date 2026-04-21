import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  private authService = inject(AuthService);

  name     = this.authService.getName()  ?? 'Admin';
  email    = this.authService.getEmail() ?? '';
  initials = this.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'AD';

  showProfile = signal(false);

  toggleProfile()  { this.showProfile.update(v => !v); }
  closeDropdowns() { this.showProfile.set(false); }
  logout()         { this.authService.logout(); }
}
