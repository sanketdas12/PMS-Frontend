import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-hr-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './hr-sidebar.component.html',
  styleUrls: ['./hr-sidebar.component.css']
})
export class HrSidebarComponent {
  navItems = [
    { label: 'Dashboard',       path: '/hr/dashboard',       icon: 'dashboard' },
    { label: 'Employees',       path: '/hr/employees',       icon: 'employees' },
    { label: 'Assign Pay',      path: '/hr/assign-pay',      icon: 'assign' },
    { label: 'Process Payroll', path: '/hr/process-payroll', icon: 'process' },
    { label: 'Payslips',        path: '/hr/payslip',         icon: 'payslip' },
  ];
}