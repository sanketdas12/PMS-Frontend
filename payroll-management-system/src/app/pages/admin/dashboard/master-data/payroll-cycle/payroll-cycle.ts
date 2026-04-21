import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PayrollCycleService, PayrollCycle } from '../../../../../core/services/payroll-cycle.service';

@Component({
  selector: 'app-payroll-cycle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payroll-cycle.html',
  styleUrl: './payroll-cycle.css',
})
export class PayrollCycleComponent implements OnInit {

  payrollCycles: PayrollCycle[] = [];
  form!: FormGroup;
  showForm       = false;
  isEditMode     = false;
  editingId: string | null = null;
  isLoading      = false;
  errorMessage   = '';
  successMessage = '';

  constructor(
    private payrollCycleService: PayrollCycleService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
  }

  initForm(): void {
    this.form = this.fb.group({
      cycleName:   ['', Validators.required],
      startDate:   ['', Validators.required],
      endDate:     ['', Validators.required],
      payoutDate:  ['', Validators.required]
    });
  }

  loadAll(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.payrollCycleService.getAll().subscribe({
      next: (data) => {
        this.payrollCycles = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load payroll cycles.';
        this.isLoading = false;
      }
    });
  }

  openAddForm(): void {
    this.isEditMode     = false;
    this.editingId      = null;
    this.errorMessage   = '';
    this.successMessage = '';
    this.form.reset();
    this.showForm = true;
  }

  onEdit(id: string): void {
    this.errorMessage = '';
    this.payrollCycleService.getById(id).subscribe({
      next: (data) => {
        this.isEditMode = true;
        this.editingId  = id;
        this.form.patchValue({
          cycleName:  data.cycleName,
          startDate:  data.startDate,
          endDate:    data.endDate,
          payoutDate: data.payoutDate
        });
        this.showForm = true;
      },
      error: () => { this.errorMessage = 'Failed to fetch payroll cycle details.'; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    const payload = this.form.value as {
      cycleName: string; startDate: string; endDate: string; payoutDate: string;
    };

    if (this.isEditMode && this.editingId) {
      this.payrollCycleService.update(this.editingId, payload).subscribe({
        next: () => {
          this.successMessage = 'Payroll cycle updated successfully.';
          this.closeForm();
          this.loadAll();
        },
        error: () => { this.errorMessage = 'Update failed. Please try again.'; }
      });
    } else {
      this.payrollCycleService.create(payload).subscribe({
        next: () => {
          this.successMessage = 'Payroll cycle created successfully.';
          this.closeForm();
          this.loadAll();
        },
        error: () => { this.errorMessage = 'Create failed. Please try again.'; }
      });
    }
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this payroll cycle?')) return;
    this.errorMessage = '';
    this.payrollCycleService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Payroll cycle deleted successfully.';
        this.loadAll();
      },
      error: () => { this.errorMessage = 'Delete failed. Please try again.'; }
    });
  }

  closeForm(): void {
    this.showForm   = false;
    this.isEditMode = false;
    this.editingId  = null;
    this.form.reset();
  }
}