import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { EmpPayStructureService, EmpPayStructureResponse } from '../../../core/services/emp-pay-structure.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component'; // ✅ ADDED

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonComponent], // ✅ CHANGED
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class HrDashboardComponent implements OnInit {
  employees: Employee[] = [];
  assignments: EmpPayStructureResponse[] = [];
  loading = true;
  error = '';

  get totalEmployees()  { return this.employees.length; }
  get activeEmployees() { return this.employees.filter(e => e.status === 'ACTIVE' || !e.status).length; }
  get assignedCount()   { return this.assignments.length; }
  get unassignedCount() { return Math.max(0, this.totalEmployees - this.assignedCount); }

  constructor(
    private empService: EmployeeService,
    private assignService: EmpPayStructureService
  ) {}

  ngOnInit() {
    this.empService.getAll().subscribe({
      next: res => { this.employees = res.data ?? res as any; this.loading = false; },
      error: () => { this.error = 'Could not load employees'; this.loading = false; }
    });
    this.assignService.getAll().subscribe({
      next: res => { this.assignments = res.data ?? []; },
      error: () => {}
    });
  }
}