import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRunResponse } from '../../../core/services/payroll.services';
import { PayrollCycleService, PayrollCycle } from '../../../core/services/payroll-cycle.service';

interface HistoryEntry {
  month: number; year: number; status: string; id: string;
}

@Component({
  standalone: true,
  selector: 'app-process-payroll',
  imports: [CommonModule, FormsModule],
  templateUrl: './process-payroll.html',
  styleUrl: './process-payroll.css',
})
export class ProcessPayrollComponent {
  selectedMonth   = new Date().getMonth() + 1;
  selectedYear    = new Date().getFullYear();
  selectedCycleId = '';
  manualCycleId   = '';
  statusMsg       = '';
  payCycles: PayrollCycle[] = [];
  history: HistoryEntry[] = [];
  step: 'idle' | 'running' | 'processing' | 'done' | 'error' = 'idle';
  runResult: PayrollRunResponse | null = null;
  errorMsg     = '';
  cyclesLoaded = false;

  months = [
    { v: 1,  l: 'January'   }, { v: 2,  l: 'February'  }, { v: 3,  l: 'March'     },
    { v: 4,  l: 'April'     }, { v: 5,  l: 'May'        }, { v: 6,  l: 'June'      },
    { v: 7,  l: 'July'      }, { v: 8,  l: 'August'     }, { v: 9,  l: 'September' },
    { v: 10, l: 'October'   }, { v: 11, l: 'November'   }, { v: 12, l: 'December'  }
  ];
  years = Array.from({ length: 3 }, (_, i) => this.selectedYear - 1 + i);

  constructor(
    private payrollService: PayrollService,
    private cycleService: PayrollCycleService
  ) {
    this.cycleService.getAll().subscribe({
      next: (r: any) => {
        this.payCycles = Array.isArray(r) ? r : (r.data ?? []);
        this.syncSelectedCycleId();
        this.cyclesLoaded = true;
      },
      error: () => {
        this.cyclesLoaded = true;
      }
    });
  }

  get effectiveCycleId(): string { return this.selectedCycleId || this.manualCycleId; }
  monthLabel(v: number): string  { return this.months.find(m => m.v === v)?.l ?? ''; }
  get cyclePlaceholder(): string {
    if (!this.cyclesLoaded) return 'Loading cycles…';
    return this.payCycles.length === 0 ? 'No cycles found' : 'Select cycle…';
  }

  get runMonth():  number { return this.runResult ? this.runResult.data.month  : this.selectedMonth; }
  get runYear():   number { return this.runResult ? this.runResult.data.year   : this.selectedYear; }
  get runStatus(): string { return this.runResult ? this.runResult.data.status : ''; }
  get runId():     string { return this.runResult ? this.runResult.data.payRollDetailsId : ''; }

  onPeriodChange() {
    this.syncSelectedCycleId();
  }

  run() {
    if (!this.effectiveCycleId) {
      this.errorMsg = 'Please select or enter a payroll cycle ID.';
      return;
    }
    this.step = 'running';
    this.errorMsg = '';
    this.payrollService.run({
      month: this.selectedMonth,
      year: this.selectedYear,
      payCycleId: this.effectiveCycleId
    }).subscribe({
      next: res => {
        this.runResult = res;
        this.step = 'processing';
        this.processPayroll(res.data.payRollDetailsId);
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Failed to initiate payroll.';
        this.step = 'error';
      }
    });
  }

  pollStatus(id: string) {
    const interval = setInterval(() => {
      this.payrollService.getStatus(id).subscribe({
        next: res => {
          const status = res.data.status; // ← fixed: res.data is the plain status string
          console.log(status);

          this.statusMsg = status;

          if (status === 'COMPLETED' || status === 'PROCESSED') {
            clearInterval(interval);
            this.step = 'done';
            this.history.unshift({
              month: this.selectedMonth,
              year: this.selectedYear,
              status,
              id
            });
          } else if (status === 'FAILED') {
            clearInterval(interval);
            this.errorMsg = 'Payroll processing failed.';
            this.step = 'error';
          }
        },
        error: () => clearInterval(interval)
      });
    }, 3000);
  }

  processPayroll(id: string) {
    this.statusMsg = 'Starting payroll processing...';

    this.payrollService.process(id).subscribe({
      next: () => {
        this.statusMsg = 'Processing payroll entries...';
        this.pollStatus(id);
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Processing failed.';
        this.step = 'error';
      }
    });
  }

  reset() { this.step = 'idle'; this.runResult = null; this.errorMsg = ''; this.statusMsg = ''; }

  private syncSelectedCycleId() {
    if (this.payCycles.length === 0) {
      this.selectedCycleId = '';
      return;
    }

    const matchedCycle = this.payCycles.find((cycle) => {
      const startDate = new Date(cycle.startDate);
      return startDate.getMonth() + 1 === this.selectedMonth &&
        startDate.getFullYear() === this.selectedYear;
    });

    this.selectedCycleId = matchedCycle?.id ?? this.payCycles[0]?.id ?? '';
  }
}