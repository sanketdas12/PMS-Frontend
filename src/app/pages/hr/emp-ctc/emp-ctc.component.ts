import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { EmpCtcService, EmployeeCTC, CreateCTCRequest, UpdateCTCRequest } from '../../../core/services/emp-ctc.service';

@Component({
  standalone: true,
  selector: 'app-emp-ctc',
  imports: [CommonModule, FormsModule],
  templateUrl: './emp-ctc.component.html',
  styleUrl: './emp-ctc.component.css'
})
export class EmpCtcComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  employeeCtcs: EmployeeCTC[] = [];
  
  selectedEmployeeId = '';
  selectedEmpCtcId = ''; // Store empCtcId for updates
  ctcAmount = '';
  
  isLoading = false;
  isSubmitting = false;
  errorMsg = '';
  successMsg = '';

  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private empCtcService: EmpCtcService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load employees and their CTCs
   */
  private loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    // Load employees
    this.employeeService.getAll(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.employees = Array.isArray(res) ? res : (res.data ?? []);
        },
        error: () => {
          this.errorMsg = 'Failed to load employees.';
          this.isLoading = false;
        }
      });

    // Load existing CTCs
    this.empCtcService.getAll(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ctcs) => {
          this.employeeCtcs = ctcs;
          this.isLoading = false;
        },
        error: () => {
          this.errorMsg = 'Failed to load CTC data.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Get employee full name
   */
  getEmployeeName(emp: Employee): string {
    const firstName = emp.firstName || '';
    const lastName = emp.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Get email for employee ID
   */
  getEmailForEmpId(empId: string): string {
    const emp = this.employees.find(e => e.empId === empId);
    return emp?.email || '-';
  }

  /**
   * Select employee and populate CTC if exists
   */
  selectEmployee(empId: string): void {
    this.selectedEmployeeId = empId;
    const ctcRecord = this.employeeCtcs.find(c => c.empId === empId);
    if (ctcRecord) {
      this.ctcAmount = ctcRecord.ctc.toString();
      this.selectedEmpCtcId = ctcRecord.empCtcId; // Store empCtcId for update
    } else {
      this.ctcAmount = '';
      this.selectedEmpCtcId = ''; // No empCtcId for new records
    }
    this.errorMsg = '';
    this.successMsg = '';
  }

  /**
   * Submit CTC for selected employee (Create or Update)
   */
  submitCtc(): void {
    if (!this.selectedEmployeeId) {
      this.errorMsg = 'Please select an employee.';
      return;
    }

    if (!this.ctcAmount || isNaN(Number(this.ctcAmount)) || Number(this.ctcAmount) <= 0) {
      this.errorMsg = 'Please enter a valid CTC amount.';
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    // If updating (empCtcId exists)
    if (this.selectedEmpCtcId) {
      this.updateCtc();
    } else {
      // If creating new
      this.createCtc();
    }
  }

  /**
   * Create new CTC
   */
  private createCtc(): void {
    const request: CreateCTCRequest = {
      empId: this.selectedEmployeeId,
      ctc: Number(this.ctcAmount)
    };

    this.empCtcService.create(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMsg = `CTC added for ${response.employeeName}`;
          this.isSubmitting = false;
          this.resetForm();
          this.loadData();
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to create CTC.';
          this.isSubmitting = false;
        }
      });
  }

  /**
   * Update existing CTC using empCtcId
   */
  private updateCtc(): void {
    const request: UpdateCTCRequest = {
      empId: this.selectedEmployeeId,
      ctc: Number(this.ctcAmount)
    };

    this.empCtcService.update(this.selectedEmpCtcId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMsg = `CTC updated for ${response.employeeName}`;
          this.isSubmitting = false;
          this.resetForm();
          this.loadData();
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to update CTC.';
          this.isSubmitting = false;
        }
      });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.selectedEmployeeId = '';
    this.selectedEmpCtcId = '';
    this.ctcAmount = '';
    this.errorMsg = '';
  }

  /**
   * Check if CTC already exists for selected employee
   */
  get isExistingCTC(): boolean {
    return !!this.selectedEmpCtcId;
  }

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}

