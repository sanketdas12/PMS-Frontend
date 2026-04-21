import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getSummary(body: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.baseUrl}/summary`, body);
  }
}