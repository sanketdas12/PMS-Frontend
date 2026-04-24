import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SalaryService, SalaryResponse } from '../../../core/services/salary.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  name   = '';
  email  = '';
  empId  = '';
  salary: SalaryResponse | null = null;
  loading: boolean | null = null;
  error   = '';
  currentMonth = new Date().getMonth() + 1;
  currentYear  = new Date().getFullYear();
  monthName    = new Date().toLocaleString('default', { month: 'long' });

  constructor(
    private authService: AuthService,
    private salaryService: SalaryService
  ) {
    this.name  = authService.getName()  ?? 'Employee';
    this.email = authService.getEmail() ?? '';
    this.empId = authService.getEmpId() ?? '';
  }

  get initials() {
    return this.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ME';
  }

  ngOnInit() {
    if (!this.empId) {
      this.loading = false;
      this.error = 'Could not load employee data.';
      return;
    }

    this.loadSalary();
  }

  loadSalary() {
    this.loading = true;
    this.error = '';
    this.salaryService.getSalary(this.empId, this.currentMonth, this.currentYear).subscribe({
      next: r  => { this.salary = r; this.loading = false; },
      error: () => { this.loading = false; }  // no salary yet — not an error
    });
  }

  earnings()   { return this.salary?.components.filter(c => c.compType === 'EARNING')   ?? []; }
  deductions() { return this.salary?.components.filter(c => c.compType === 'DEDUCTION') ?? []; }
}
