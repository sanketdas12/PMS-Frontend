import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmploymentType, PayStructure, PayStructureService } from '../../../../../core/services/pay-structure.service';
import { SalaryComponentService } from '../../../../../core/services/salary-component.service';
import { SalaryComponent } from '../../../../../shared/models/salary.model';

@Component({
  selector: 'app-pay-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pay-structure.component.html',
  styleUrls: ['./pay-structure.component.css']
})
export class PayStructureComponent implements OnInit {

  employmentTypes: EmploymentType[] = [];
  payStructures: any[] = []; // 👈 changed to any because backend shape differs
  salaryComponents: SalaryComponent[] = [];
  selectedEmpTypeId = '';
  form!: FormGroup;
  showForm = false;
  isEditMode = false;
  editingId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  readonly calculationTypes = ['PERCENTAGE', 'FIXED'];
  readonly calculationBases = ['CTC', 'BASIC', 'GROSS'];

  constructor(
    private fb: FormBuilder,
    private payStructureService: PayStructureService,
    private salaryComponentService: SalaryComponentService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadEmploymentTypes();
    this.loadSalaryComponents();
  }

  initForm(): void {
    this.form = this.fb.group({
      salaryComponentId: ['', Validators.required],
      employmentTypeId: ['', Validators.required],
      calculationType: ['PERCENTAGE', Validators.required],
      calculationBase: ['CTC'],
      percentage: [null],
      fixedAmount: [null],
      isOptional: [false]
    });
  }

  loadSalaryComponents(): void {
    this.salaryComponentService.getAll().subscribe({
      next: data => {
        this.salaryComponents = data;
      },
      error: () => { }
    });
  }

  loadEmploymentTypes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.payStructureService.getEmploymentTypes().subscribe({
      next: types => {
        this.employmentTypes = Array.isArray(types) ? types : [];

        if (this.employmentTypes.length === 0) {
          this.payStructures = [];
          this.selectedEmpTypeId = '';
          this.isLoading = false;
          return;
        }

        this.selectedEmpTypeId = this.selectedEmpTypeId || this.employmentTypes[0].id;
        this.loadStructures(this.selectedEmpTypeId);
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Failed to load employment types.';
        this.isLoading = false;
      }
    });
  }

  loadStructures(employmentTypeId: string): void {
    this.selectedEmpTypeId = employmentTypeId;
    this.isLoading = true;
    this.errorMessage = '';

    if (!employmentTypeId) {
      this.payStructures = [];
      this.isLoading = false;
      return;
    }

    this.payStructureService.getByEmploymentType(employmentTypeId).subscribe({
      next: data => {

        // ✅ IMPORTANT FIX: map backend → UI
        this.payStructures = (data || []).map((item: any) => ({
          id: item.payStructId,
          salaryComponentId: item.compId,
          salaryComponentName: item.compName,
          employmentTypeId: this.selectedEmpTypeId,
          calculationType: item.calculationType,
          calculationBase: item.calculationBase,
          percentage: item.percentage,
          fixedAmount: item.fixedAmount,
          isOptional: item.isOptional ?? false
        }));

        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Failed to load pay structures.';
        this.isLoading = false;
      }
    });
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.form.reset({
      salaryComponentId: '',
      employmentTypeId: this.selectedEmpTypeId,
      calculationType: 'PERCENTAGE',
      calculationBase: 'CTC',
      percentage: null,
      fixedAmount: null,
      isOptional: false
    });

    this.showForm = true;
  }

  onEdit(id: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    const item = this.payStructures.find(x => x.id === id);

    if (!item) {
      this.errorMessage = 'Failed to fetch pay structure.';
      return;
    }

    this.isEditMode = true;
    this.editingId = item.id;

    this.form.patchValue({
      salaryComponentId: item.salaryComponentId,
      employmentTypeId: item.employmentTypeId,
      calculationType: item.calculationType,
      calculationBase: item.calculationBase,
      percentage: item.percentage,
      fixedAmount: item.fixedAmount,
      isOptional: item.isOptional
    });

    this.showForm = true;
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

        const empId = payload.employmentTypeId || this.selectedEmpTypeId;
        this.closeForm();
        this.loadStructures(empId);
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Operation failed.';
      }
    });
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this pay structure?')) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.payStructureService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted successfully.';
        this.loadStructures(this.selectedEmpTypeId);
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Delete failed.';
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingId = null;
    this.form.reset();
  }

  // ✅ SIMPLIFIED (no lookup needed anymore)
  getSalaryComponentName(structure: any): string {
    return structure?.salaryComponentName ?? 'N/A';
  }

  getEmploymentTypeLabel(id?: string): string {
    if (!id) return 'N/A';
    return this.employmentTypes.find(e => e.id === id)?.name ?? 'Unknown';
  }

  get calcType(): string {
    return this.form.get('calculationType')?.value;
  }

  private buildPayload(): PayStructure {
    const v = this.form.getRawValue();

    const payload: any = {
      salaryComponentId: v.salaryComponentId,
      employmentTypeId: v.employmentTypeId,
      calculationType: v.calculationType,
      isOptional: !!v.isOptional
    };

    if (v.calculationType === 'PERCENTAGE') {
      payload.calculationBase = v.calculationBase;
      payload.percentage = v.percentage;
    } else {
      payload.fixedAmount = v.fixedAmount;
    }

    return payload;
  }
}