import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-revision-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './revision-history.html',
  styleUrl: './revision-history.css'
})
export class RevisionHistory implements OnInit {
  loading: boolean | null = null;
  error: string | null = null;
  searchQuery = '';
  selectedMonth = '';
  selectedYear = '';

  months: { v: number; l: string }[] = [
    { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' }, { v: 4, l: 'April' },
    { v: 5, l: 'May' }, { v: 6, l: 'June' }, { v: 7, l: 'July' }, { v: 8, l: 'August' },
    { v: 9, l: 'September' }, { v: 10, l: 'October' }, { v: 11, l: 'November' }, { v: 12, l: 'December' }
  ];
  years: number[] = [2024, 2025, 2026];
  revisions: Array<{
    firstName: string;
    lastName: string;
    department?: string;
    month: number;
    year: number;
    previousNet: number;
    revisedNet: number;
    status: string;
  }> = [];
  filtered = [...this.revisions];

  ngOnInit() {
    this.loading = false;
    this.search();
  }

  search() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.revisions.filter(r => {
      const matchSearch = q
        ? `${r.firstName} ${r.lastName} ${r.department ?? ''}`.toLowerCase().includes(q)
        : true;
      const matchMonth = this.selectedMonth ? r.month === +this.selectedMonth : true;
      const matchYear = this.selectedYear ? r.year === +this.selectedYear : true;
      return matchSearch && matchMonth && matchYear;
    });
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      COMPLETED: 'pill-green',
      PENDING: 'pill-amber',
      REJECTED: 'pill-red'
    };
    return map[status] ?? 'pill-amber';
  }
}
