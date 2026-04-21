import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { RouterOutlet } from '@angular/router';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  standalone: true,
  selector: 'app-payroll-revisions',
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './payroll-revisions.html',
  styleUrl: './payroll-revisions.css',
})
export class PayrollRevisionsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  searchQuery   = '';
  selectedMonth = '';
  selectedYear  = '';

  months: { v: number; l: string }[] = [
    {v:1,l:'January'},{v:2,l:'February'},{v:3,l:'March'},{v:4,l:'April'},
    {v:5,l:'May'},{v:6,l:'June'},{v:7,l:'July'},{v:8,l:'August'},
    {v:9,l:'September'},{v:10,l:'October'},{v:11,l:'November'},{v:12,l:'December'}
  ];
  years: number[] = [2024, 2025, 2026];
  revisions: any[] = [];
  filtered:  any[] = [];

  ngOnInit() {
    // TODO: wire to revision API when available
    this.loading = false;
  }

  search() {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.revisions.filter(r => {
      const matchSearch = q
        ? `${r.firstName} ${r.lastName} ${r.department ?? ''}`.toLowerCase().includes(q)
        : true;
      const matchMonth = this.selectedMonth ? r.month === +this.selectedMonth : true;
      const matchYear  = this.selectedYear  ? r.year  === +this.selectedYear  : true;
      return matchSearch && matchMonth && matchYear;
    });
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      'COMPLETED': 'pill-green',
      'PENDING':   'pill-amber',
      'REJECTED':  'pill-red',
    };
    return map[status] ?? 'pill-amber';
  }
}
