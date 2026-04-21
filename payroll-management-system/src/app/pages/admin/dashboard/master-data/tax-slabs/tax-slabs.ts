import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaxSlabService, TaxSlab } from '../../../../../core/services/tax-slabs.service';

@Component({
  selector: 'app-tax-slabs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tax-slabs.html'
})
export class TaxSlabs implements OnInit {
  taxSlabs: TaxSlab[] = [];
  form!: FormGroup;
  showForm = false;
  isEditMode = false;
  isLoading = false;
  filterYear = '';
  successMessage = '';
  errorMessage = '';
  selectedId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private taxSlabService: TaxSlabService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadAll();
  }

  initForm() {
    this.form = this.fb.group({
      financialYear: ['', Validators.required],
      minIncome: [0, Validators.required],
      maxIncome: [0, Validators.required],
      taxPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  loadAll() {
    this.isLoading = true;
    this.errorMessage = '';

    this.taxSlabService.getAll().subscribe({
      next: (data: TaxSlab[]) => {
        this.taxSlabs = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to load tax slabs.';
        this.isLoading = false;
      }
    });
  }

  openAddForm() {
    this.isEditMode = false;
    this.selectedId = null;
    this.form.reset({
      financialYear: '',
      minIncome: 0,
      maxIncome: 0,
      taxPercentage: 0
    });
    this.showForm = true;
  }

  applyFilter() {
    this.isLoading = true;
    this.errorMessage = '';

    this.taxSlabService.getAll(this.filterYear).subscribe({
      next: (data: TaxSlab[]) => {
        this.taxSlabs = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to filter tax slabs.';
        this.isLoading = false;
      }
    });
  }

  onEdit(id: string) {
    const item = this.taxSlabs.find(x => x.id === id);
    if (!item) return;

    this.selectedId = id;
    this.isEditMode = true;
    this.showForm = true;

    this.form.patchValue(item);
  }

  onDelete(id: string) {
    this.errorMessage = '';

    this.taxSlabService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted successfully';
        this.loadAll();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to delete tax slab.';
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.isEditMode && this.selectedId) {
      this.taxSlabService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.loadAll();
          this.closeForm();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Failed to update tax slab.';
        }
      });
    } else {
      this.taxSlabService.create(payload).subscribe({
        next: () => {
          this.loadAll();
          this.closeForm();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Failed to create tax slab.';
        }
      });
    }
  }

  closeForm() {
    this.showForm = false;
    this.form.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }
}
