import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeeRevision {
  revisionId: string;
  empId: string;
  employeeName: string;
  revisionName?: string;
  month: number;
  year: number;
  amount: number;
  email?: string;
  isActive?: boolean;
}

export interface CreateRevisionRequest {
  empId: string;
  revisionId: string;
  month: number;
  year: number;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class EmployeeRevisionService {
  private baseUrl = `${environment.apiUrl}/revisions`;

  constructor(private http: HttpClient) {}

  create(request: CreateRevisionRequest): Observable<EmployeeRevision> {
    return this.http.post<EmployeeRevision>(this.baseUrl, request).pipe(
      catchError((err) => {
        console.error('Error creating employee revision:', err);
        return throwError(() => err);
      })
    );
  }
}
