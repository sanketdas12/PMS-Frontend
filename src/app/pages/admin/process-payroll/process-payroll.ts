import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRunResponse, PayrollStatusResponse } from '../../../core/services/payroll.services';
import { PayrollCycleService, PayrollCycle } from '../../../core/services/payroll-cycle.service';
import { SalaryService } from '../../../core/services/salary.service';
import { PayrollReportService } from '../../../core/services/payroll-report.service';

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
export class ProcessPayrollComponent implements OnInit, OnDestroy {
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
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private pollFailureCount = 0;
  private pollAttemptCount = 0;
  private autoResetTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

  months = [
    { v: 1,  l: 'January'   }, { v: 2,  l: 'February'  }, { v: 3,  l: 'March'     },
    { v: 4,  l: 'April'     }, { v: 5,  l: 'May'        }, { v: 6,  l: 'June'      },
    { v: 7,  l: 'July'      }, { v: 8,  l: 'August'     }, { v: 9,  l: 'September' },
    { v: 10, l: 'October'   }, { v: 11, l: 'November'   }, { v: 12, l: 'December'  }
  ];
  years = Array.from({ length: 3 }, (_, i) => this.selectedYear - 1 + i);

  constructor(
    private payrollService: PayrollService,
    private cycleService: PayrollCycleService,
    private salaryService: SalaryService,
    private payrollReportService: PayrollReportService
  ) {}

  ngOnInit() {
    this.loadPayrollCycles();
  }

  ngOnDestroy() {
    this.clearPolling();
    this.clearAutoReset();
    this.clearPollTimeout();
  }

  private loadPayrollCycles() {
    this.cyclesLoaded = false;
    this.payCycles = [];
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
    this.clearPolling();
    this.step = 'running';
    this.errorMsg = '';
    this.statusMsg = '';

    console.log('[Payroll] Step 1: Initiating payroll run...');
    this.payrollService.run({
      month: this.selectedMonth,
      year: this.selectedYear,
      payCycleId: this.effectiveCycleId
    }).subscribe({
      next: res => {
        console.log('[Payroll] Step 2: Run initiated, got payRollDetailsId:', res.data.payRollDetailsId);
        this.runResult = res;
        this.processPayroll(res.data.payRollDetailsId);
      },
      error: err => {
        console.error('[Payroll] Run failed:', err);
        this.errorMsg = err?.error?.message ?? 'Failed to initiate payroll.';
        this.step = 'error';
      }
    });
  }

  pollStatus(id: string) {
    console.log('[Payroll] Starting poll for ID:', id);
    this.clearPolling();
    this.clearAutoReset();
    this.clearPollTimeout();
    this.pollFailureCount = 0;
    this.pollAttemptCount = 0;

    // Safety timeout: if no completion after 5 minutes, show error
    this.pollTimeoutId = setTimeout(() => {
      console.error('[Payroll] Poll timeout - no completion after 5 minutes');
      this.clearPolling();
      this.errorMsg = 'Payroll processing timeout - please check status manually.';
      this.step = 'error';
    }, 5 * 60 * 1000);

    this.pollIntervalId = setInterval(() => {
      this.pollAttemptCount += 1;
      console.log(`[Payroll] Poll attempt ${this.pollAttemptCount}...`);

      this.payrollService.getStatus(id).subscribe({
        next: res => {
          this.pollFailureCount = 0;
          const status = this.extractStatus(res);

          console.log(`[Payroll] Poll response - status: ${status}`);

          if (!status) {
            console.log('[Payroll] No status in response, waiting...');
            return;
          }

          this.statusMsg = status;
          this.syncRunResultStatus(status, res);

          if (this.isCompletedStatus(status)) {
            console.log('[Payroll] Step 5: Payroll completed!');
            this.clearPolling();
            this.clearPollTimeout();
            this.salaryService.clearCache();
            this.payrollReportService.clearCache();
            this.step = 'done';
            this.history.unshift({
              month: this.selectedMonth,
              year: this.selectedYear,
              status,
              id
            });
            this.scheduleAutoReset();
          } else if (status === 'FAILED' || status === 'ERROR') {
            console.error('[Payroll] Processing failed with status:', status);
            this.clearPolling();
            this.clearPollTimeout();
            this.errorMsg = 'Payroll processing failed.';
            this.step = 'error';
          }
        },
        error: err => {
          this.pollFailureCount += 1;
          console.error(`[Payroll] Poll error (${this.pollFailureCount}/3):`, err?.error?.message ?? err?.message);

          if (this.pollFailureCount >= 3) {
            console.error('[Payroll] Poll max retries exceeded');
            this.clearPolling();
            this.clearPollTimeout();
            this.errorMsg = err?.error?.message ?? 'Unable to fetch payroll status.';
            this.step = 'error';
          }
        }
      });
    }, 3000);
  }

  processPayroll(id: string) {
    console.log('[Payroll] Step 3: Processing payroll for ID:', id);
    this.step = 'processing';
    this.statusMsg = 'Starting payroll processing...';

    this.payrollService.process(id).subscribe({
      next: () => {
        console.log('[Payroll] Step 4: Process call succeeded, starting polling...');
        this.statusMsg = 'Processing payroll entries...';
        this.pollStatus(id);
      },
      error: err => {
        console.error('[Payroll] Process failed:', err);
        this.errorMsg = err?.error?.message ?? 'Processing failed.';
        this.step = 'error';
      }
    });
  }

  reset() {
    this.clearPolling();
    this.clearAutoReset();
    this.clearPollTimeout();
    this.step = 'idle';
    this.runResult = null;
    this.errorMsg = '';
    this.statusMsg = '';
  }

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

  private clearPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  private clearPollTimeout() {
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
      this.pollTimeoutId = null;
    }
  }

  private extractStatus(res: PayrollStatusResponse): string {
    const rawStatus = typeof res.data === 'string' ? res.data : res.data?.status;
    return rawStatus?.trim().toUpperCase() ?? '';
  }

  private isCompletedStatus(status: string): boolean {
    return ['COMPLETED', 'PROCESSED', 'SUCCESS', 'DONE'].includes(status);
  }

  private syncRunResultStatus(
    status: string,
    res: PayrollStatusResponse
  ) {
    if (!this.runResult) {
      return;
    }

    const nextData = typeof res.data === 'string'
      ? {}
      : {
          payRollDetailsId: res.data.payRollDetailsId ?? this.runResult.data.payRollDetailsId,
          month: res.data.month ?? this.runResult.data.month,
          year: res.data.year ?? this.runResult.data.year
        };

    this.runResult = {
      ...this.runResult,
      data: {
        ...this.runResult.data,
        ...nextData,
        status
      }
    };
  }

  private clearAutoReset() {
    if (this.autoResetTimeoutId) {
      clearTimeout(this.autoResetTimeoutId);
      this.autoResetTimeoutId = null;
    }
  }

  private scheduleAutoReset() {
    this.clearAutoReset();
    this.autoResetTimeoutId = setTimeout(() => {
      this.reset();
    }, 3000);
  }
}
