import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PayStructure, PayStructureService, PayStructureResponse } from '../../../../../core/services/pay-structure.service';
import { SalaryComponentService } from '../../../../../core/services/salary-component.service';
import { SalaryComponent } from '../../../../../shared/models/salary.model';

@Component({
  selector: 'app-pay-structure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pay-structure.component.html',
  styleUrls: ['./pay-structure.component.css']
})
export class PayStructureComponent implements OnInit {

  payStructures:    PayStructureResponse[] = [];
  salaryComponents: SalaryComponent[]      = [];
  form!: FormGroup;
  showForm       = false;
  isEditMode     = false;
  editingId: string | null = null;
  isLoading      = false;
  errorMessage   = '';
  successMessage = '';

  readonly calculationTypes = ['PERCENTAGE', 'FIXED'];
  readonly calculationBases = ['CTC', 'BASIC', 'GROSS'];

  // Common employment types — update UUIDs to match your backend
  readonly employmentTypes = [
    { id: 'ffa3d3db-20a2-44a1-8881-3b9f4d4dc292', label: 'Full Time' },
    { id: 'a503a069-a6b8-4b74-a78f-3e45a71ee4c8', label: 'Part Time' },
    { id: 'b612c170-b9c9-5c85-b89g-4f56b82ff3a3', label: 'Contract'  },
  ];

  constructor(
    private fb: FormBuilder,
    private payStructureService: PayStructureService,
    private salaryComponentService: SalaryComponentService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
    this.loadSalaryComponents();
  }

  initForm(): void {
    this.form = this.fb.group({
      salaryComponentId: ['', Validators.required],
      employmentTypeId:  ['', Validators.required],
      calculationType:   ['PERCENTAGE', Validators.required],
      calculationBase:   ['CTC'],
      percentage:        [null],
      fixedAmount:       [null],
      isOptional:        [false]
    });
  }

  loadSalaryComponents(): void {
    this.salaryComponentService.getAll().subscribe({
      next: data => { this.salaryComponents = data; },
      error: () => {}
    });
  }

  loadAll(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.payStructureService.getAll(true).subscribe({
      next: data => { this.payStructures = data; this.isLoading = false; },
      error: err  => { this.errorMessage = err?.error?.message ?? 'Failed to load pay structures.'; this.isLoading = false; }
    });
  }

  openAddForm(): void {
    this.isEditMode     = false;
    this.editingId      = null;
    this.errorMessage   = '';
    this.successMessage = '';
    this.form.reset({ calculationType: 'PERCENTAGE', calculationBase: 'CTC', isOptional: false });
    this.showForm = true;
  }

  onEdit(id: string): void {
    this.errorMessage   = '';
    this.successMessage = '';
    this.payStructureService.getById(id).subscribe({
      next: (data: any) => {
        const item = Array.isArray(data) ? data[0] : data;
        this.isEditMode = true;
        this.editingId  = item.id;
        this.form.patchValue({
          salaryComponentId: item.salaryComponentId,
          employmentTypeId:  item.employmentTypeId,
          calculationType:   item.calculationType  ?? 'PERCENTAGE',
          calculationBase:   item.calculationBase  ?? 'CTC',
          percentage:        item.percentage,
          fixedAmount:       item.fixedAmount,
          isOptional:        item.isOptional
        });
        this.showForm = true;
      },
      error: err => { this.errorMessage = err?.error?.message ?? 'Failed to fetch pay structure.'; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';
    const payload = this.buildPayload();

    const action$ = this.isEditMode && this.editingId
      ? this.payStructureService.update(this.editingId, payload)
      : this.payStructureService.create(payload);

    action$.subscribe({
      next: () => {
        this.successMessage = this.isEditMode
          ? 'Pay structure updated successfully.'
          : 'Pay structure created successfully.';
        this.closeForm();
        this.loadAll();
      },
      error: err => { this.errorMessage = err?.error?.message ?? 'Operation failed. Please try again.'; }
    });
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this pay structure?')) return;
    this.errorMessage   = '';
    this.successMessage = '';
    this.payStructureService.delete(id).subscribe({
      next: () => { this.successMessage = 'Pay structure deleted successfully.'; this.loadAll(); },
      error: err => { this.errorMessage = err?.error?.message ?? 'Delete failed.'; }
    });
  }

  closeForm(): void {
    this.showForm   = false;
    this.isEditMode = false;
    this.editingId  = null;
    this.errorMessage = '';
    this.form.reset();
  }

  getSalaryComponentName(id: string): string {
    return this.salaryComponents.find(c => c.id === id)?.name ?? id.slice(0, 8) + '…';
  }

  getEmploymentTypeLabel(id: string): string {
    return this.employmentTypes.find(e => e.id === id)?.label ?? id.slice(0, 8) + '…';
  }

  get calcType(): string { return this.form.get('calculationType')?.value; }

  private buildPayload(): PayStructure {
    const v = this.form.getRawValue();
    const payload: PayStructure = {
      salaryComponentId: v.salaryComponentId,
      employmentTypeId:  v.employmentTypeId,
      calculationType:   v.calculationType,
      isOptional:        !!v.isOptional
    };
    if (v.calculationType === 'PERCENTAGE') {
      payload.calculationBase = v.calculationBase;
      payload.percentage      = v.percentage;
    } else {
      payload.fixedAmount = v.fixedAmount;
    }
    return payload;
  }
}