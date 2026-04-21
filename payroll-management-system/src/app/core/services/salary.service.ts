import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SalaryComponent {
  compId: string;
  compName: string;
  compType: 'EARNING' | 'DEDUCTION';
  amount: number;
}

export interface SalaryResponse {
  empId: string;
  components: SalaryComponent[];
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
}

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private baseUrl = `${environment.apiUrl}/salary`;
  constructor(private http: HttpClient) {}

  getSalary(empId: string, month: number, year: number): Observable<SalaryResponse> {
    return this.http.get<SalaryResponse>(`${this.baseUrl}?empId=${empId}&month=${month}&year=${year}`);
  }

  getPdfUrl(empId: string, month: number, year: number): string {
    return `${this.baseUrl}/pdf?empId=${empId}&month=${month}&year=${year}`;
  }
}