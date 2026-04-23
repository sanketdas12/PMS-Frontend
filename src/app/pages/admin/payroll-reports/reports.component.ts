import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollReportService, ReportRequest, ReportRow } from '../../../core/services/payroll-report.service';

@Component({
  selector: 'app-payroll-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class PayrollReportsComponent implements OnInit {
  month   = new Date().getMonth() + 1;
  year    = new Date().getFullYear();
  empId   = '';
  deptId  = '';
  sortBy  = 'netSalary';
  sortDir = 'desc';
  page    = 0;
  size    = 20;

  rows:          ReportRow[] = [];
  totalElements  = 0;
  totalPages     = 0;
  isLast         = false;
  loading: boolean | null = null;
  error          = '';

  months = [
    {v:1,l:'January'},{v:2,l:'February'},{v:3,l:'March'},{v:4,l:'April'},
    {v:5,l:'May'},{v:6,l:'June'},{v:7,l:'July'},{v:8,l:'August'},
    {v:9,l:'September'},{v:10,l:'October'},{v:11,l:'November'},{v:12,l:'December'}
  ];
  years = [2024, 2025, 2026];

  sortOptions = [
    { v: 'firstName',       l: 'First Name Ascending'   },
    { v: 'firstName,desc',  l: 'First Name Descending' },
    { v: 'netSalary',       l: 'Net Salary Ascending'   },
    { v: 'netSalary,desc',  l: 'Net Salary Descending' },
    { v: 'grossSalary',     l: 'Gross Salary Ascending'  },
    { v: 'grossSalary,desc',l: 'Gross Salary Descending' },
    { v: 'totalDeductions', l: 'Deductions Ascending'   },
    { v: 'totalDeductions,desc', l: 'Deductions Descending'   },
  ];

  constructor(private reportService: PayrollReportService) {}

  ngOnInit() { this.fetch(); }

  fetch() {
    this.loading = true;
    this.error   = '';
    const body = this.buildRequestBody();

    this.reportService.getSummary(body).subscribe({
      next: res => {
        this.rows          = res.content       ?? [];
        this.totalElements = res.totalElements ?? 0;
        this.totalPages    = res.totalPages    ?? 0;
        this.isLast        = res.last          ?? true;
        this.loading       = false;
      },
      error: err => {
        this.error   = err?.error?.message ?? 'Could not load reports. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.empId = this.empId.trim();
    this.deptId = this.deptId.trim();
    this.page = 0;
    this.fetch();
  }

  reset() {
    this.month   = new Date().getMonth() + 1;
    this.year    = new Date().getFullYear();
    this.empId   = '';
    this.deptId  = '';
    this.sortBy  = 'netSalary';
    this.sortDir = 'desc';
    this.page    = 0;
    this.fetch();
  }

  prevPage() { if (this.page > 0)             { this.page--; this.fetch(); } }
  nextPage() { if (!this.isLast)              { this.page++; this.fetch(); } }

  monthLabel(v: number) { return this.months.find(m => m.v === v)?.l ?? ''; }

  get totalGross()       { return this.rows.reduce((s, r) => s + r.grossSalary,     0); }
  get totalNet()         { return this.rows.reduce((s, r) => s + r.netSalary,       0); }
  get totalDeductionsSum() { return this.rows.reduce((s, r) => s + r.totalDeductions, 0); }

  statusClass(s: string) {
    return s === 'COMPLETED' ? 'pill-green' : 'pill-amber';
  }

  private buildRequestBody(): ReportRequest {
    const body: ReportRequest = {
      month: this.month,
      year: this.year,
      page: this.page,
      size: this.size,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    };

    if (this.empId.trim().length > 0) {
      body.empId = this.empId.trim();
    }

    if (this.deptId.trim().length > 0) {
      body.deptId = this.deptId.trim();
    }

    return body;
  }
}

