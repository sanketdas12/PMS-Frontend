import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
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

  ngOnInit() {
    if (!this.empId) {
      this.error = 'Profile not found. Please contact HR.';
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin({
      emp: this.empService.getById(this.empId).pipe(
        catchError(() => of(null))
      ),
      assign: this.assignService.getByEmpId(this.empId).pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: ({ emp, assign }) => {
        this.emp = emp?.data ?? null;
        this.assign = assign?.data ?? null;

        if (!this.emp) {
          this.error = 'Profile not found. Please contact HR.';
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load profile. Please try again.';
        this.loading = false;
      }
    });
  }
}
