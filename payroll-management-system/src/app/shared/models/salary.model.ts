export interface SalaryComponent {
  id: string;
  name: string;
  type: string;   // 'EARNING' | 'DEDUCTION'
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}