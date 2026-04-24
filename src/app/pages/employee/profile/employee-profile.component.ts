import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService, Employee, Department, Designation } from '../../../core/services/employee.service';
import { EmpPayStructureService, EmpPayStructureResponse } from '../../../core/services/emp-pay-structure.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {
  empId   = '';
  name    = '';
  email   = '';
  emp: Employee | null = null;
  assign: EmpPayStructureResponse | null = null;
  loading: boolean | null = null;
  error   = '';

  constructor(
    private authService: AuthService,
    private empService: EmployeeService,
    private assignService: EmpPayStructureService
  ) {
    this.name  = authService.getName()  ?? 'Employee';
    this.email = authService.getEmail() ?? '';
    this.empId = authService.getEmpId() ?? '';
  }

  get initials() {
    return this.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ME';
  }

  deptLabel(): string {
    const d = this.emp?.department;
    if (!d || (typeof d === 'object' && Object.keys(d).length === 0)) return '—';
    return typeof d === 'string' ? d : (d.deptName ?? '—');
  }

  designationLabel(): string {
    const d = this.emp?.designation;
    if (!d || (typeof d === 'object' && Object.keys(d).length === 0)) return '—';
    return typeof d === 'string' ? d : (d.title ?? '—');
  }

  statusLabel(): string {
    if (!this.emp) return '—';
    const s = this.emp.status;
    if (s) return s;
    return this.emp.isActive === false ? 'Inactive' : 'Active';
  }

  noticeLabel(): string {
    const n = this.emp?.noticePeriod;
    return n != null ? `${n} days` : '—';
  }

  ngOnInit() {
    this.loading = true;
    this.error = '';

    this.empService.getAll().subscribe({
      next: (res: any) => {
        const allEmployees: Employee[] = Array.isArray(res) ? res : (res.data ?? []);
        // Match logged-in employee by email (most reliable)
        this.emp = allEmployees.find(e => e.email === this.email) ?? null;

        if (!this.emp) {
          this.error = 'Profile not found. Please contact HR.';
          this.loading = false;
          return;
        }

        this.empId = this.emp.empId;
        this.name = `${this.emp.firstName ?? ''} ${this.emp.lastName ?? ''}`.trim();

        this.assignService.getByEmpId(this.empId).pipe(
          catchError(() => of(null))
        ).subscribe({
          next: (assign: any) => {
            this.assign = assign?.data ?? null;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Could not load profile. Please try again.';
        this.loading = false;
      }
    });
  }
}
