import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RevisionTypeService, RevisionType } from '../../../../../core/services/revision-type.service';

@Component({
  selector: 'app-revision-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './revision-types.html',
  styleUrl: './revision-types.css'
})
export class RevisionTypes implements OnInit, OnDestroy {

  revisionTypes: RevisionType[] = [];
  form!: FormGroup;
  showForm   = false;
  isEditMode = false;
  editingId: string | null = null;
  isLoading      = false;
  errorMessage   = '';
  successMessage = '';
  private loadSub?: Subscription;
  private loadRequestId = 0;

  readonly categories = ['BONUS', 'REIMBURSEMENT', 'DEDUCTION', 'INCREMENT', 'ALLOWANCE'];

  constructor(
    private revisionTypeService: RevisionTypeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  initForm(): void {
    this.form = this.fb.group({
      revisionName: ['', Validators.required],
      category:     ['', Validators.required]
    });
  }

  loadAll(forceRefresh = false): void {
    this.loadSub?.unsubscribe();

    this.isLoading    = true;
    this.errorMessage = '';
    const requestId = ++this.loadRequestId;

    this.loadSub = this.revisionTypeService.getAll(forceRefresh).subscribe({
      next: (data) => {
        if (requestId !== this.loadRequestId) return;
        this.revisionTypes = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        if (requestId !== this.loadRequestId) return;
        this.isLoading = false;
        this.errorMessage = err.status === 403
          ? 'Access denied. You do not have permission to view revision types.'
          : 'Failed to load revision types. Please try again.';
      }
    });
  }

  openAddForm(): void {
    this.isEditMode     = false;
    this.editingId      = null;
    this.errorMessage   = '';
    this.successMessage = '';
    this.form.reset({ revisionName: '', category: '' });
    this.showForm = true;
  }

  onEdit(id: string): void {
    this.errorMessage = '';
    this.revisionTypeService.getById(id).subscribe({
      next: (data) => {
        this.isEditMode = true;
        this.editingId  = id;
        this.form.patchValue({
          revisionName: data.revisionName,
          category:     data.category
        });
        this.showForm = true;
      },
      error: (err) => {
        this.errorMessage = err.status === 403
          ? 'Access denied. You do not have permission to edit.'
          : 'Failed to fetch revision type details.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = this.form.value as { revisionName: string; category: string };
    this.errorMessage = '';

    if (this.isEditMode && this.editingId) {
      this.revisionTypeService.update(this.editingId, payload).subscribe({
        next: () => {
          this.successMessage = 'Revision type updated successfully.';
          this.closeForm();
          this.loadAll(true);
        },
        error: (err) => {
          this.errorMessage = err.status === 403
            ? 'Access denied. You do not have permission to update.'
            : 'Update failed. Please try again.';
        }
      });
    } else {
      this.revisionTypeService.create(payload).subscribe({
        next: () => {
          this.successMessage = 'Revision type created successfully.';
          this.closeForm();
          this.loadAll(true);
        },
        error: (err) => {
          this.errorMessage = err.status === 403
            ? 'Access denied. You do not have permission to create.'
            : 'Create failed. Please try again.';
        }
      });
    }
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this revision type?')) return;
    this.errorMessage = '';
    this.revisionTypeService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Revision type deleted successfully.';
        this.revisionTypes = this.revisionTypes.filter(item => item.id !== id);
        this.loadAll(true);
      },
      error: (err) => {
        this.errorMessage = err.status === 403
          ? 'Access denied. You do not have permission to delete.'
          : 'Delete failed. Please try again.';
      }
    });
  }

  closeForm(): void {
    this.showForm   = false;
    this.isEditMode = false;
    this.editingId  = null;
    this.form.reset();
  }
}
