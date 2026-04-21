import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PayrollRunRequest {
  month: number;
  year: number;
  payCycleId: string;
}

export interface PayrollRunResponse {
  data: {
    month: number;
    year: number;
    payRollDetailsId: string;
    status: string;
  };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private baseUrl = `${environment.apiUrl}/payroll`;
  constructor(private http: HttpClient) {}

  /** POST /payroll/run then POST /payroll/process/{id} */
  runAndProcess(req: PayrollRunRequest): Observable<{ data: string; message: string }> {
    return this.http.post<PayrollRunResponse>(`${this.baseUrl}/run`, req).pipe(
      switchMap(res =>
        this.http.post<{ data: string; message: string }>(
          `${this.baseUrl}/process/${res.data.payRollDetailsId}`,
          {}
        )
      )
    );
  }

  run(req: PayrollRunRequest): Observable<PayrollRunResponse> {
    return this.http.post<PayrollRunResponse>(`${this.baseUrl}/run`, req);
  }

  process(payrollDetailsId: string): Observable<{ data: string; message: string }> {
    return this.http.post<{ data: string; message: string }>(
      `${this.baseUrl}/process/${payrollDetailsId}`, {}
    );
  }

  getPayrollDetails(empId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/payroll-details/employee/${empId}`);
  }
}