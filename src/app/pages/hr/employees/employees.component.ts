import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component'; // ✅ ADDED

@Component({
  selector: 'app-hr-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class HrEmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filtered: Employee[] = [];
  loading: boolean | null = null;
  error = '';
  searchQuery = '';
  showModal = false;
  saving = false;
  saveMsg = '';
  form: Partial<Employee> = { firstName: '', lastName: '', email: '', department: '', designation: '' };

  constructor(private empService: EmployeeService) {}

  ngOnInit() { this.loadEmployees(); }

  loadEmployees() {
    this.loading = true;
    this.empService.getAll().subscribe({
      next: res => {
        this.employees = res.data ?? (res as any);
        this.filtered = this.employees;
        this.loading = false;
      },
      error: () => { this.error = 'Could not load employees.'; this.loading = false; }
    });
  }

  search() {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.employees.filter(e => {
      const dept = typeof e.department === 'string' ? e.department : (e.department?.deptName ?? '');
      return `${e.firstName} ${e.lastName} ${e.email} ${dept}`.toLowerCase().includes(q);
    });
  }

  openModal() {
    this.form = { firstName: '', lastName: '', email: '', department: '', designation: '' };
    this.showModal = true;
    this.saveMsg = '';
  }

  save() {
    if (!this.form.firstName || !this.form.email) {
      this.saveMsg = 'First name and email are required.'; return;
    }
    this.saving = true;
    this.empService.create(this.form).subscribe({
      next: () => { this.saving = false; this.showModal = false; this.loadEmployees(); },
      error: () => { this.saveMsg = 'Failed to create employee.'; this.saving = false; }
    });
  }

  initials(e: Employee) {
    return `${e.firstName?.[0] ?? ''}${e.lastName?.[0] ?? ''}`.toUpperCase();
  }

  statusClass(s?: string) {
    return s === 'INACTIVE' ? 'pill-amber' : 'pill-green';
  }
}