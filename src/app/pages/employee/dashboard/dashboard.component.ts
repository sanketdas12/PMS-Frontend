import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SalaryService, SalaryResponse } from '../../../core/services/salary.service';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
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
    private salaryService: SalaryService,
    private empService: EmployeeService
  ) {
    this.name  = authService.getName()  ?? 'Employee';
    this.email = authService.getEmail() ?? '';
    this.empId = authService.getEmpId() ?? '';
  }

  get initials() {
    return this.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ME';
  }

  ngOnInit() {
  this.empService.getAll().subscribe({
    next: (res) => {
      const all: Employee[] = res.data ?? (res as any);
      const found =
        all.find(e => e.email?.toLowerCase() === this.email?.toLowerCase()) ??
        all.find(e => e.empId === this.empId);

      if (found) {
        this.empId = found.empId;
        this.loadSalary(); // ← owns loading = false
      } else {
        this.loading = false;
        this.error = 'Could not load employee data.';
      }
    },
    error: () => {
      if (this.empId) {
        this.loadSalary();
      } else {
        this.loading = false;
        this.error = 'Could not load employee data.';
      }
    }
  });
}

  loadSalary() {
    this.salaryService.getSalary(this.empId, this.currentMonth, this.currentYear).subscribe({
      next: r  => { this.salary = r; this.loading = false; },
      error: () => { this.loading = false; }  // no salary yet — not an error
    });
  }

  earnings()   { return this.salary?.components.filter(c => c.compType === 'EARNING')   ?? []; }
  deductions() { return this.salary?.components.filter(c => c.compType === 'DEDUCTION') ?? []; }
}
