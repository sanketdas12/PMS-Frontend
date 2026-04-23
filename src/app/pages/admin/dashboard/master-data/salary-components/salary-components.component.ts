import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SalaryComponentService } from '../../../../../core/services/salary-component.service';
import { SalaryComponent } from '../../../../../shared/models/salary.model';

@Component({
  selector: 'app-salary-components',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salary-components.component.html',
  styleUrls: ['./salary-components.component.css']
})
export class SalaryComponentsComponent implements OnInit {

  salaryComponents: SalaryComponent[] = [];
  form!: FormGroup;
  showForm = false;
  isEditMode = false;
  editingId: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private salaryService: SalaryComponentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      isActive: [true]
    });
  }

  loadAll(): void {
    this.isLoading = true;

    this.salaryService.getAll().subscribe({
      next: (data: SalaryComponent[]) => {
        this.salaryComponents = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.form.reset({ name: '', type: '', isActive: true });
    this.showForm = true;
  }

  onEdit(id: string): void {
    this.salaryService.getById(id).subscribe({
      next: (data: SalaryComponent) => {
        this.isEditMode = true;
        this.editingId = id;
        this.form.patchValue(data);
        this.showForm = true;
      },
      error: (err: any) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.isEditMode && this.editingId) {
      this.salaryService.update(this.editingId, payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadAll();
        },
        error: (err: any) => console.error(err)
      });
    } else {
      this.salaryService.create(payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadAll();
        },
        error: (err: any) => console.error(err)
      });
    }
  }

  onDelete(id: string): void {
    if (!confirm('Delete this component?')) return;

    this.salaryService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => console.error(err)
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingId = null;
    this.form.reset();
  }
}