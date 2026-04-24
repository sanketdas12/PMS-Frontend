import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeNavbarComponent } from '../employee-navbar/employee-navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmpPayStructureService } from '../../core/services/emp-pay-structure.service';
import { SalaryService } from '../../core/services/salary.service';

@Component({
  selector: 'app-employee-shell',
  standalone: true,
  imports: [RouterOutlet, EmployeeNavbarComponent],
  template: `
    <div class="shell-root">
      <app-employee-navbar></app-employee-navbar>
      <main class="shell-main"><router-outlet></router-outlet></main>
    </div>`,
  styles: [`:host{display:block;height:100vh;overflow:hidden}
    .shell-root{display:flex;flex-direction:column;height:100vh}
    .shell-main{flex:1;overflow-y:auto;background:var(--bg)}`]
})
export class EmployeeShellComponent implements OnInit, OnDestroy {
  private warmupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private empPayStructureService: EmpPayStructureService,
    private salaryService: SalaryService
  ) {}

  ngOnInit(): void {
    const empId = this.authService.getEmpId();
    if (!empId) {
      return;
    }

    this.warmupTimer = setTimeout(() => {
      const today = new Date();
      this.employeeService.getById(empId).subscribe({ error: () => {} });
      this.empPayStructureService.getByEmpId(empId).subscribe({ error: () => {} });
      this.salaryService.getSalary(empId, today.getMonth() + 1, today.getFullYear()).subscribe({ error: () => {} });
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.warmupTimer) {
      clearTimeout(this.warmupTimer);
      this.warmupTimer = null;
    }
  }
}
