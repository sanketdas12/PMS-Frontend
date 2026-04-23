import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarChild  { label: string; path: string; }
export interface SidebarItem   { label: string; icon: string; path?: string; key?: string; badge?: string; badgeClass?: string; children?: SidebarChild[]; }
export interface SidebarSection { title: string; items: SidebarItem[]; }

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  expanded = signal<string[]>(['master-data']);

  sections: SidebarSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' }
      ]
    },
    {
      title: 'Payroll',
      items: [
        { label: 'Revision History', path: '/admin/payroll-revisions/revision-history', icon: 'revision' },
        { label: 'Employee Payslip', path: '/admin/payslip/employee', icon: 'payslip' }
      ]
    },
    {
      title: 'Master Data',
      items: [
        {
          label: 'Master Data', icon: 'master', key: 'master-data',
          children: [
            { label: 'Salary Components', path: '/admin/master-data/salary-components' },
            { label: 'Pay Structure',     path: '/admin/master-data/pay-structure' },
            { label: 'Revision Types',    path: '/admin/master-data/revision-types' },
            { label: 'Tax Slabs',         path: '/admin/master-data/tax-slabs' },
            { label: 'Payroll Cycle',     path: '/admin/master-data/payroll-cycle' }
          ]
        }
      ]
    },
    {
      title: 'Reports',
      items: [
        { label: 'Payroll Reports', path: '/admin/payroll-reports', icon: 'reports' }
      ]
    }
  ];

  toggleExpand(key: string): void {
    this.expanded.update(list =>
      list.includes(key) ? list.filter(k => k !== key) : [...list, key]
    );
  }

  isExpanded(key: string): boolean { return this.expanded().includes(key); }
  getKey(item: SidebarItem): string { return item.key ?? item.label.toLowerCase().replace(/\s+/g, '-'); }
}
