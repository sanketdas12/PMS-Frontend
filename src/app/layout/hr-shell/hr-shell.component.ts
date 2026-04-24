import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HrNavbarComponent } from '../hr-navbar/hr-navbar.component';
import { HrSidebarComponent } from '../hr-sidebar/hr-sidebar.component';
import { EmployeeService } from '../../core/services/employee.service';
import { EmpPayStructureService } from '../../core/services/emp-pay-structure.service';
import { PayStructureService } from '../../core/services/pay-structure.service';
import { PayrollCycleService } from '../../core/services/payroll-cycle.service';
import { EmpCtcService } from '../../core/services/emp-ctc.service';
import { RevisionTypeService } from '../../core/services/revision-type.service';

@Component({
  selector: 'app-hr-shell',
  standalone: true,
  imports: [RouterOutlet, HrNavbarComponent, HrSidebarComponent],
  template: `
    <div class="shell-root">
      <app-hr-navbar></app-hr-navbar>
      <div class="shell-body">
        <app-hr-sidebar></app-hr-sidebar>
        <main class="shell-main"><router-outlet></router-outlet></main>
      </div>
    </div>`,
  styles: [`:host{display:block;height:100vh;overflow:hidden}
    .shell-root{display:flex;flex-direction:column;height:100vh}
    .shell-body{display:flex;flex:1;overflow:hidden}
    .shell-main{flex:1;overflow-y:auto;background:var(--bg)}`]
})
export class HrShellComponent implements OnInit, OnDestroy {
  private warmupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private employeeService: EmployeeService,
    private empPayStructureService: EmpPayStructureService,
    private payStructureService: PayStructureService,
    private payrollCycleService: PayrollCycleService,
    private empCtcService: EmpCtcService,
    private revisionTypeService: RevisionTypeService
  ) {}

  ngOnInit(): void {
    this.warmupTimer = setTimeout(() => {
      this.employeeService.getAll().subscribe({ error: () => {} });
      this.empPayStructureService.getAll().subscribe({ error: () => {} });
      this.payrollCycleService.getAll().subscribe({ error: () => {} });
      this.empCtcService.getAll().subscribe({ error: () => {} });
      this.revisionTypeService.getAll().subscribe({ error: () => {} });
      this.payStructureService.getEmploymentTypes().subscribe({
        next: (types) => {
          types.forEach((type) => {
            this.payStructureService.getByEmploymentType(type.id).subscribe({ error: () => {} });
          });
        },
        error: () => {}
      });
    }, 600);
  }

  ngOnDestroy(): void {
    if (this.warmupTimer) {
      clearTimeout(this.warmupTimer);
      this.warmupTimer = null;
    }
  }
}
