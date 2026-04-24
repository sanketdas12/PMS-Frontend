import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },

  // ── ADMIN (ROLE_ADMIN) ──────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ROLE_ADMIN' },
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: 'dashboard',       loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'employees',       loadComponent: () => import('./pages/hr/employees/employees.component').then(m => m.HrEmployeesComponent) },
      { path: 'master-data',     loadChildren: () => import('./pages/admin/dashboard/master-data/master-data.routes').then(m => m.MASTER_DATA_ROUTES) },
      { path: 'assign-pay',      loadComponent: () => import('./pages/admin/assign-pay/assign-pay.component').then(m => m.AssignPayComponent) },
      { path: 'process-payroll', loadComponent: () => import('./pages/admin/process-payroll/process-payroll').then(m => m.ProcessPayrollComponent) },

      // Payroll Revisions with children
      {
        path: 'payroll-revisions',
        loadComponent: () => import('./pages/admin/payroll-revisions/payroll-revisions').then(m => m.PayrollRevisionsComponent),
        children: [
          { path: 'revision-history',  loadComponent: () => import('./pages/admin/payroll-revisions/revision-history/revision-history').then(m => m.RevisionHistory) },
          { path: '', redirectTo: 'revision-history', pathMatch: 'full' }
        ]
      },

      // Payslip with children
      {
        path: 'payslip',
        loadComponent: () => import('./pages/admin/payslip/payslip').then(m => m.PayslipComponent),
        children: [
          { path: 'employee', loadComponent: () => import('./pages/admin/payslip/employee/employee').then(m => m.PayslipEmployee) },
          { path: 'bulk',     loadComponent: () => import('./pages/admin/payslip/bulk/bulk').then(m => m.Bulk) },
          { path: '', redirectTo: 'employee', pathMatch: 'full' }
        ]
      },

      // Payroll Reports with children
      {
        path: 'payroll-reports',
        loadComponent: () => import('./pages/admin/payroll-reports/reports.component').then(m => m.PayrollReportsComponent),
        children: [
          { path: 'summary',    loadComponent: () => import('./pages/admin/payroll-reports/summary/summary').then(m => m.Summary) },
          { path: 'department', loadComponent: () => import('./pages/admin/payroll-reports/department/department').then(m => m.Department) },
          { path: 'employee',   loadComponent: () => import('./pages/admin/payroll-reports/employee/employee').then(m => m.EmployeeReport) },
          { path: 'deduction',  loadComponent: () => import('./pages/admin/payroll-reports/deduction/deduction').then(m => m.Deduction) },
          { path: 'tax',        loadComponent: () => import('./pages/admin/payroll-reports/tax/tax').then(m => m.Tax) },
          { path: 'revision',   loadComponent: () => import('./pages/admin/payroll-reports/revision/revision').then(m => m.Revision) },
          { path: '', redirectTo: 'summary', pathMatch: 'full' }
        ]
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── HR (ROLE_HR) ────────────────────────────────────────────────────
  {
    path: 'hr',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ROLE_HR' },
    loadComponent: () =>
      import('./layout/hr-shell/hr-shell.component').then(m => m.HrShellComponent),
    children: [
      { path: 'dashboard',       loadComponent: () => import('./pages/hr/dashboard/dashboard.component').then(m => m.HrDashboardComponent) },
      { path: 'employees',       loadComponent: () => import('./pages/hr/employees/employees.component').then(m => m.HrEmployeesComponent) },
      { path: 'assign-pay',      loadComponent: () => import('./pages/hr/assign-pay/hr-assign-pay.component').then(m => m.HrAssignPayComponent) },
      { path: 'emp-ctc',         loadComponent: () => import('./pages/hr/emp-ctc/emp-ctc.component').then(m => m.EmpCtcComponent) },
      { path: 'emp-revision',    loadComponent: () => import('./pages/hr/employee-revision/employee-revision.component').then(m => m.EmployeeRevisionComponent) },
      { path: 'payslip',         loadComponent: () => import('./pages/hr/payslip/hr-payslip.component').then(m => m.HrPayslipComponent) },
      { path: 'process-payroll', loadComponent: () => import('./pages/admin/process-payroll/process-payroll').then(m => m.ProcessPayrollComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── EMPLOYEE (ROLE_EMP) ─────────────────────────────────────────────
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ROLE_EMP' },
    loadComponent: () =>
      import('./layout/employee-shell/employee-shell.component').then(m => m.EmployeeShellComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/employee/dashboard/dashboard.component').then(m => m.EmployeeDashboardComponent) },
      { path: 'payslip',   loadComponent: () => import('./pages/employee/payslip/employee-payslip.component').then(m => m.EmployeePayslipComponent) },
      { path: 'profile',   loadComponent: () => import('./pages/employee/profile/employee-profile.component').then(m => m.EmployeeProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
