import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportRow {
  empId:            string;
  deptId:           string;
  email:            string;
  empSalaryId:      string;
  firstName:        string;
  lastName:         string;
  phone:            string;
  status:           string;
  grossSalary:      number;
  totalDeductions:  number;
  netSalary:        number;
  month:            number;
  year:             number;
  payrollDetailsId: string;
}

export interface ReportResponse {
  content:       ReportRow[];
  totalElements: number;
  totalPages:    number;
  page:          number;
  size:          number;
  last:          boolean;
}

export interface ReportRequest {
  month:    number;
  year:     number;
  page:     number;
  size:     number;
  sortBy:   string;
  sortDir:  string;
  empId?:   string;
  deptId?:  string;
}

@Injectable({ providedIn: 'root' })
export class PayrollReportService {
  private baseUrl = `${environment.apiUrl}/payroll/reports`;
  private summaryCache = new Map<string, Observable<ReportResponse>>();

  constructor(private http: HttpClient) {}

  getSummary(body: ReportRequest, forceRefresh = false): Observable<ReportResponse> {
    const cacheKey = JSON.stringify(body);

    if (forceRefresh) {
      this.summaryCache.delete(cacheKey);
    }

    const cached = this.summaryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const request$ = this.http.post<ReportResponse>(`${this.baseUrl}/summary`, body).pipe(
      catchError((err) => {
        this.summaryCache.delete(cacheKey);
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    this.summaryCache.set(cacheKey, request$);
    return request$;
  }

  clearCache(): void {
    this.summaryCache.clear();
  }
}
