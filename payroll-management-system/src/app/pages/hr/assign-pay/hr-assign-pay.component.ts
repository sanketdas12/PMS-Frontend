import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { PayStructureService, PayStructureResponse } from '../../../core/services/pay-structure.service';
import { EmpPayStructureService, EmpPayStructureResponse } from '../../../core/services/emp-pay-structure.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component'; // ✅ ADDED

@Component({
  selector: 'app-hr-assign-pay',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent], // ✅ CHANGED
  templateUrl: './hr-assign-pay.component.html',
  styleUrl: './hr-assign-pay.component.css'
})
export class HrAssignPayComponent implements OnInit {
  employees: Employee[] = [];
  payStructures: PayStructureResponse[] = [];
  assignments: EmpPayStructureResponse[] = [];
  selectedEmpId    = '';
  selectedStructId = '';
  loading     = false;
  loadingData = true;
  msg     = '';
  msgType: 'success' | 'error' = 'success';
  private loaded = 0;

  constructor(
    private empService: EmployeeService,
    private psService: PayStructureService,
    private assignService: EmpPayStructureService
  ) {}

  ngOnInit() {
    this.empService.getAll().subscribe({
      next: r => { this.employees = r.data ?? (r as any); this.checkReady(); },
      error: () => this.checkReady()
    });
    this.psService.getAll().subscribe({
      next: r => { this.payStructures = Array.isArray(r) ? r : (r as any).data ?? []; this.checkReady(); },
      error: () => this.checkReady()
    });
    this.loadAssignments();
  }

  checkReady() { this.loaded++; if (this.loaded >= 2) this.loadingData = false; }

  loadAssignments() {
    this.assignService.getAll().subscribe({
      next: r => { this.assignments = r.data ?? []; },
      error: () => {}
    });
  }

  assign() {
    if (!this.selectedEmpId || !this.selectedStructId) {
      this.msg = 'Please select both an employee and a pay structure.';
      this.msgType = 'error';
      return;
    }
    this.loading = true;
    this.msg = '';
    this.assignService.assign({ empId: this.selectedEmpId, payStructureId: this.selectedStructId }).subscribe({
      next: res => {
        this.msg = res.message ?? 'Assigned successfully.';
        this.msgType = 'success';
        this.loading = false;
        this.selectedEmpId = '';
        this.selectedStructId = '';
        this.loadAssignments();
      },
      error: err => {
        this.msg = err?.error?.message ?? 'Failed to assign pay structure.';
        this.msgType = 'error';
        this.loading = false;
      }
    });
  }

  deleteAssignment(id: string) {
    this.assignService.delete(id).subscribe({
      next: () => this.loadAssignments(),
      error: () => {}
    });
  }

  empName(empId: string): string {
    const e = this.employees.find(e => e.empId === empId);
    return e ? `${e.firstName} ${e.lastName}` : empId.slice(0, 8) + '...';
  }

  structLabel(ps: PayStructureResponse): string {
    if (ps.fixedAmount != null) return `Fixed — Rs.${ps.fixedAmount}`;
    if (ps.percentage  != null) return `Percentage — ${ps.percentage}%`;
    return ps.id ? ps.id.slice(0, 8) + '...' : 'Unknown';
  }
}