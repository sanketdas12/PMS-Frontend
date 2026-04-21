import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SalaryService, SalaryResponse } from '../../../core/services/salary.service';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-employee-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './employee-payslip.component.html',
  styleUrls: ['./employee-payslip.component.css']
})
export class EmployeePayslipComponent implements OnInit {
  empId = '';
  name  = '';
  email = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear  = new Date().getFullYear();
  salary: SalaryResponse | null = null;
  loading       = false;
  initializing  = true;
  error         = '';

  months = [
    {v:1,l:'January'},{v:2,l:'February'},{v:3,l:'March'},{v:4,l:'April'},
    {v:5,l:'May'},{v:6,l:'June'},{v:7,l:'July'},{v:8,l:'August'},
    {v:9,l:'September'},{v:10,l:'October'},{v:11,l:'November'},{v:12,l:'December'}
  ];
  years = [2024, 2025, 2026];

  constructor(
    private authService: AuthService,
    private salaryService: SalaryService,
    private empService: EmployeeService
  ) {
    this.name  = authService.getName()  ?? 'Employee';
    this.email = authService.getEmail() ?? '';
    this.empId = authService.getEmpId() ?? '';
  }

  ngOnInit() {
    // Resolve real empId by email
    this.empService.getAll().subscribe({
      next: res => {
        const all: Employee[] = res.data ?? (res as any);
        const found = all.find(e => e.email?.toLowerCase() === this.email?.toLowerCase())
                   ?? all.find(e => e.empId === this.empId);
        if (found) this.empId = found.empId;
        this.initializing = false;
        this.fetch();
      },
      error: () => {
        this.initializing = false;
        if (this.empId) this.fetch();
      }
    });
  }

  fetch() {
    if (!this.empId) { this.error = 'Employee ID not found. Please log in again.'; return; }
    this.loading = true; this.error = ''; this.salary = null;
    this.salaryService.getSalary(this.empId, this.selectedMonth, this.selectedYear).subscribe({
      next: r  => { this.salary = r; this.loading = false; },
      error: err => {
        this.error   = err?.error?.message ?? 'Could not fetch salary. Payroll may not have been processed yet.';
        this.loading = false;
      }
    });
  }

  downloadPdf() {
    window.open(this.salaryService.getPdfUrl(this.empId, this.selectedMonth, this.selectedYear), '_blank');
  }

  earnings()   { return this.salary?.components.filter(c => c.compType === 'EARNING')   ?? []; }
  deductions() { return this.salary?.components.filter(c => c.compType === 'DEDUCTION') ?? []; }
  monthLabel() { return this.months.find(m => m.v === this.selectedMonth)?.l ?? ''; }
}
