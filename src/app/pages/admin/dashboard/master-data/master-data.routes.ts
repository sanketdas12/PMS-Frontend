import { Routes } from '@angular/router';
import { MasterDataComponent } from './master-data.component';
import { RevisionTypes } from './revision-types/revision-types';
import { SalaryComponentsComponent } from './salary-components/salary-components.component';
import { PayStructureComponent } from './pay-structure/pay-structure.component';
import { PayrollCycleComponent } from './payroll-cycle/payroll-cycle';
import { TaxSlabs } from './tax-slabs/tax-slabs';
import { authGuard } from '../../../../core/guards/auth.guard';
import { roleGuard } from '../../../../core/guards/role.guard';

export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    component: MasterDataComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ROLE_ADMIN' },
    children: [
      { path: '', redirectTo: 'salary-components', pathMatch: 'full' },
      { path: 'salary-components', component: SalaryComponentsComponent },
      { path: 'pay-structure',     component: PayStructureComponent },
      { path: 'revision-types',    component: RevisionTypes },
      { path: 'payroll-cycle',     component: PayrollCycleComponent },
      { path: 'tax-slabs',         component: TaxSlabs }
    ]
  }
];