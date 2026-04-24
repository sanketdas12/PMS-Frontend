import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { RevisionType, RevisionTypeService } from '../../../core/services/revision-type.service';
import { EmployeeRevisionService, CreateRevisionRequest, EmployeeRevision } from '../../../core/services/employee-revision.service';

@Component({
  standalone: true,
  selector: 'app-employee-revision',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-revision.component.html',
  styleUrls: ['./employee-revision.component.css']
})
export class EmployeeRevisionComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  revisionTypes: RevisionType[] = [];
  revisions: EmployeeRevision[] = [];

  selectedEmployeeId = '';
  selectedRevisionTypeId = '';
  month = '';
  year = '';
  amount = '';

  isLoading = true;
  isSubmitting = false;
  errorMsg = '';
  successMsg = '';

  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private revisionTypeService: RevisionTypeService,
    private employeeRevisionService: EmployeeRevisionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';
    console.log('Loading employee data...');

    // this.employeeService.getAll(true).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (res) => {
    //     console.log('Raw employee response:', res);
    //     this.employees = Array.isArray(res.data) ? res.data : res.data ?? [];
    //     this.isLoading = false;
    //     // Log the employee data for debugging
    //     console.log('Employee data loaded:', this.employees);
    //     // Check if we have data
    //     if (this.employees.length > 0) {
    //       console.log('First employee:', this.employees[0]);
    //       console.log('Generated name for first employee:', this.getEmployeeName(this.employees[0]));
    //     } else {
    //       console.log('No employees found in response');
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error loading employee data:', error);
    //     this.errorMsg = 'Unable to load employee list.';
    //     this.isLoading = false;
    //   }
    // });

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

    this.revisionTypeService.getAll(true).pipe(takeUntil(this.destroy$)).subscribe({
      next: (types) => {
        this.revisionTypes = Array.isArray(types) ? types : [];
      },
      error: () => {
        this.errorMsg = 'Unable to load revision types.';
      }
    });

    this.employeeRevisionService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (revs) => {
        this.revisions = Array.isArray(revs) ? revs : [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Unable to load revision records.';
        this.isLoading = false;
      }
    });
  }

  getEmployeeName(employee: Employee): string {
    const fullName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
    console.log('Employee object:', employee);
    console.log('Generated full name:', fullName);
    return fullName || 'Unknown Employee';
  }

  getEmailForEmpId(empId: string): string {
    const employee = this.employees.find((emp) => emp.empId === empId);
    return employee?.email ?? '-';
  }

  getRevisionName(revisionId: string): string {
    return this.revisionTypes.find((type) => type.id === revisionId)?.revisionName ?? '-';
  }

  submitRevision(): void {
    if (!this.selectedEmployeeId) {
      this.errorMsg = 'Please select an employee.';
      return;
    }

    if (!this.selectedRevisionTypeId) {
      this.errorMsg = 'Please select a revision type.';
      return;
    }

    const monthNumber = Number(this.month);
    const yearNumber = Number(this.year);
    const amountNumber = Number(this.amount);

    if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
      this.errorMsg = 'Please enter a valid month between 1 and 12.';
      return;
    }

    if (!yearNumber || yearNumber < 2000) {
      this.errorMsg = 'Please enter a valid year.';
      return;
    }

    if (!amountNumber || amountNumber <= 0) {
      this.errorMsg = 'Please enter a valid revision amount.';
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: CreateRevisionRequest = {
      empId: this.selectedEmployeeId,
      revisionId: this.selectedRevisionTypeId,
      month: monthNumber,
      year: yearNumber,
      amount: amountNumber
    };

    this.employeeRevisionService.create(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (created) => {
        this.successMsg = `Revision recorded for ${created.employeeName || this.getEmployeeName(this.employees.find(e => e.empId === created.empId) ?? { empId: '', firstName: '', lastName: '', email: '' })}`;
        this.revisions.unshift({
          ...created,
          revisionName: created.revisionName || this.getRevisionName(created.revisionId),
          email: created.email || this.getEmailForEmpId(created.empId)
        });
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to create employee revision.';
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.selectedEmployeeId = '';
    this.selectedRevisionTypeId = '';
    this.month = '';
    this.year = '';
    this.amount = '';
  }
}
