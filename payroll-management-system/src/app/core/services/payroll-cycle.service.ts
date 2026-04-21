import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PayrollCycle {
  id?: string;
  cycleName: string;
  startDate: string;
  endDate: string;
  payoutDate: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PayrollCycleService {

  private baseUrl = `${environment.apiUrl}/payroll-cycles`;
  private allPayrollCycles$?: Observable<PayrollCycle[]>;

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<PayrollCycle[]> {
    if (!this.allPayrollCycles$ || forceRefresh) {
      this.allPayrollCycles$ = this.http.get<PayrollCycle[]>(this.baseUrl).pipe(
        catchError((err) => {
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.allPayrollCycles$;
  }

  getById(id: string): Observable<PayrollCycle> {
    return this.http.get<PayrollCycle>(`${this.baseUrl}/${id}`);
  }

  create(data: { cycleName: string; startDate: string; endDate: string; payoutDate: string }): Observable<PayrollCycle> {
    return this.http.post<PayrollCycle>(this.baseUrl, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: string, data: { cycleName: string; startDate: string; endDate: string; payoutDate: string }): Observable<PayrollCycle> {
    return this.http.put<PayrollCycle>(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.allPayrollCycles$ = undefined;
  }
}
