import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
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
  private salaryByPeriod = new Map<string, Observable<SalaryResponse>>();

  constructor(private http: HttpClient) {}

  getSalary(empId: string, month: number, year: number, forceRefresh = false): Observable<SalaryResponse> {
    const cacheKey = `${empId}:${month}:${year}`;

    if (forceRefresh) {
      this.salaryByPeriod.delete(cacheKey);
    }

    const cached = this.salaryByPeriod.get(cacheKey);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<SalaryResponse>(`${this.baseUrl}?empId=${empId}&month=${month}&year=${year}`).pipe(
      catchError((err) => {
        this.salaryByPeriod.delete(cacheKey);
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    this.salaryByPeriod.set(cacheKey, request$);
    return request$;
  }

  getPdfUrl(empId: string, month: number, year: number): string {
    return `${this.baseUrl}/pdf?empId=${empId}&month=${month}&year=${year}`;
  }

  clearCache(): void {
    this.salaryByPeriod.clear();
  }
}
