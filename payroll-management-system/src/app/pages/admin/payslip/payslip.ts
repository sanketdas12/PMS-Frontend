import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { RouterOutlet } from '@angular/router';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { SalaryService, SalaryResponse } from '../../../core/services/salary.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  standalone: true,
  selector: 'app-payslip',
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './payslip.html',
  styleUrl: './payslip.css',
})
export class PayslipComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmpId = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear  = new Date().getFullYear();
  salary: SalaryResponse | null = null;
  loading = false;
  error   = '';

  months = [
    {v:1,l:'January'},{v:2,l:'February'},{v:3,l:'March'},{v:4,l:'April'},
    {v:5,l:'May'},{v:6,l:'June'},{v:7,l:'July'},{v:8,l:'August'},
    {v:9,l:'September'},{v:10,l:'October'},{v:11,l:'November'},{v:12,l:'December'}
  ];
  years = [2024, 2025, 2026];

  constructor(private empService: EmployeeService, private salaryService: SalaryService) {}

  ngOnInit() {
    this.empService.getAll().subscribe({
      next: r => { this.employees = r.data ?? (r as any); },
      error: () => {}
    });
  }

  fetch() {
    if (!this.selectedEmpId) { this.error = 'Please select an employee.'; return; }
    this.loading = true; this.error = ''; this.salary = null;
    this.salaryService.getSalary(this.selectedEmpId, this.selectedMonth, this.selectedYear).subscribe({
      next: r  => { this.salary = r; this.loading = false; },
      error: err => { this.error = err?.error?.message ?? 'Could not fetch salary.'; this.loading = false; }
    });
  }

  downloadPdf() {
    if (!this.salary) return;
    window.open(this.salaryService.getPdfUrl(this.selectedEmpId, this.selectedMonth, this.selectedYear), '_blank');
  }

  earnings()   { return this.salary?.components.filter(c => c.compType === 'EARNING')   ?? []; }
  deductions() { return this.salary?.components.filter(c => c.compType === 'DEDUCTION') ?? []; }
  monthLabel() { return this.months.find(m => m.v === this.selectedMonth)?.l ?? ''; }
  empName() {
    const e = this.employees.find(e => e.empId === this.selectedEmpId);
    return e ? `${e.firstName} ${e.lastName}` : '—';
  }
}
