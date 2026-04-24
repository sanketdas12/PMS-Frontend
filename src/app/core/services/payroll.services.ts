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

export interface PayrollStatusResponse {
  data: {
    payRollDetailsId?: string;
    status?: string;
    month?: number;
    year?: number;
  } | string;
  message: string;
}

export interface PayrollBatchResponse {
  data: any;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private baseUrl = `${environment.apiUrl}/payroll`;

  constructor(private http: HttpClient) {}

  // Existing
  runAndProcess(req: PayrollRunRequest): Observable<{ data: string; message: string }> {
    return this.http.post<PayrollRunResponse>(`${this.baseUrl}/run`, req).pipe(
      switchMap(res =>
        this.http.post<{ data: string; message: string }>(
          `${this.baseUrl}/process/${res.data.payRollDetailsId}`, {}
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

  // NEW: Poll status during step 2 buffering
  getStatus(payRollDetailsId: string): Observable<PayrollStatusResponse> {
    return this.http.get<PayrollStatusResponse>(
      `${this.baseUrl}/status/${payRollDetailsId}`
    );
  }

  // NEW: Get batch details after processing
  getBatch(payRollDetailsId: string): Observable<PayrollBatchResponse> {
    return this.http.get<PayrollBatchResponse>(
      `${this.baseUrl}/batch/${payRollDetailsId}`
    );
  }

  // NEW: Retry a failed payroll run
  retry(payRollDetailsId: string): Observable<{ data: string; message: string }> {
    return this.http.post<{ data: string; message: string }>(
      `${this.baseUrl}/retry/${payRollDetailsId}`, {}
    );
  }

  // NEW: Get payroll summary report
  getSummary(req: PayrollRunRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/summary`, req);
  }

  getPayrollDetails(empId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/payroll-details/employee/${empId}`);
  }
}
