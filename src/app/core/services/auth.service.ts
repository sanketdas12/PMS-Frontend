import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken) {
          localStorage.setItem('token', res.accessToken);
          try {
            const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
            const roles: string[] = payload.roles ?? [];
            if (roles.length > 0)  localStorage.setItem('role', roles[0]);
            if (payload.sub)       localStorage.setItem('userId', payload.sub);   // user UUID
            if (payload.emp_id)    localStorage.setItem('empId', payload.emp_id); // FIXED: actual empId
            if (payload.email)     localStorage.setItem('email', payload.email);  // also store from token
          } catch (e) {
            console.error('Failed to decode token', e);
          }
        }
        if (res.user) {
          if (res.user.userName) localStorage.setItem('name', res.user.userName);
          if (res.user.email)    localStorage.setItem('email', res.user.email);
        }
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((res: any) => {
        if (res.accessToken) {
          localStorage.setItem('token', res.accessToken);
          try {
            const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
            const roles: string[] = payload.roles ?? [];
            if (roles.length > 0)  localStorage.setItem('role', roles[0]);
            if (payload.sub)       localStorage.setItem('userId', payload.sub);   // user UUID
            if (payload.emp_id)    localStorage.setItem('empId', payload.emp_id); // FIXED: actual empId
          } catch (e) {}
        }
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  navigateByRole(): void {
    const role = this.getRole();
    if (role === 'ROLE_ADMIN')    this.router.navigate(['/admin/dashboard']);
    else if (role === 'ROLE_HR')  this.router.navigate(['/hr/dashboard']);
    else if (role === 'ROLE_EMP') this.router.navigate(['/employee/dashboard']);
    else                          this.router.navigate(['/login']);
  }

  getToken(): string | null        { return localStorage.getItem('token'); }
  getRefreshToken(): string | null { return localStorage.getItem('refreshToken'); }
  getRole(): string | null         { return localStorage.getItem('role'); }
  getUserId(): string | null       { return localStorage.getItem('userId'); } // sub
  getEmpId(): string | null        { return localStorage.getItem('empId'); }  // emp_id ✅
  getEmail(): string | null        { return localStorage.getItem('email'); }
  getName(): string | null         { return localStorage.getItem('name'); }
  isLoggedIn(): boolean            { return !!localStorage.getItem('token'); }
}