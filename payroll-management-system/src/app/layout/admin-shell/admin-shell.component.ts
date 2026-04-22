import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { EmployeeService } from '../../core/services/employee.service';
import { EmpPayStructureService } from '../../core/services/emp-pay-structure.service';
import { PayStructureService } from '../../core/services/pay-structure.service';
import { SalaryComponentService } from '../../core/services/salary-component.service';
import { PayrollCycleService } from '../../core/services/payroll-cycle.service';
import { RevisionTypeService } from '../../core/services/revision-type.service';
import { TaxSlabService } from '../../core/services/tax-slabs.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, AdminNavbarComponent, AdminSidebarComponent],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.css']
})
export class AdminShellComponent implements OnInit {
  private warmupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private employeeService: EmployeeService,
    private empPayStructureService: EmpPayStructureService,
    private payStructureService: PayStructureService,
    private salaryComponentService: SalaryComponentService,
    private payrollCycleService: PayrollCycleService,
    private revisionTypeService: RevisionTypeService,
    private taxSlabService: TaxSlabService
  ) {}

  ngOnInit(): void {
    // Defer non-critical warmup so the dashboard can load first without competing requests.
    this.warmupTimer = setTimeout(() => {
      this.employeeService.getAll().subscribe({ error: () => {} });
      this.empPayStructureService.getAll().subscribe({ error: () => {} });
      this.payStructureService.getEmploymentTypes().subscribe({
        next: types => {
          types.forEach(type => {
            this.payStructureService.getByEmploymentType(type.id).subscribe({ error: () => {} });
          });
        },
        error: () => {}
      });
      this.salaryComponentService.getAll().subscribe({ error: () => {} });
      this.payrollCycleService.getAll().subscribe({ error: () => {} });
      this.revisionTypeService.getAll().subscribe({ error: () => {} });
      this.taxSlabService.getAll().subscribe({ error: () => {} });
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.warmupTimer) {
      clearTimeout(this.warmupTimer);
      this.warmupTimer = null;
    }
  }
}
