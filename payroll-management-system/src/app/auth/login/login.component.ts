import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  helperMsg = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter your credentials.';
      this.helperMsg = '';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.helperMsg = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.authService.navigateByRole();
      },
      error: () => {
        this.errorMsg = 'Invalid email or password.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }

  forgotPassword() {
    this.errorMsg = '';
    this.helperMsg = 'Please contact your administrator or HR team to reset your password.';
  }
}
