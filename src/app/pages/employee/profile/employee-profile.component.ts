import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    // Load all employees and find by email (since empId in localStorage is user UUID)
    this.empService.getAll().subscribe({
      next: res => {
        const all: Employee[] = res.data ?? (res as any);
        // Match by email first, then fallback to empId match
        const found = all.find(e => e.email?.toLowerCase() === this.email?.toLowerCase())
                   ?? all.find(e => e.empId === this.empId);
        if (found) {
          this.emp   = found;
          this.empId = found.empId; // use the real empId
          this.loading = false;
          // Now load pay assignment with the real empId
          this.assignService.getByEmpId(found.empId).subscribe({
            next: r => { this.assign = r.data ?? (r as any); },
            error: () => {}
          });
        } else {
          this.error   = 'Profile not found. Please contact HR.';
          this.loading = false;
        }
      },
      error: () => {
        this.error   = 'Could not load profile. Please try again.';
        this.loading = false;
      }
    });
  }
}
