import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmpPayStructureAssign {
  empId: string;
  payStructureId: string;
}

export interface EmpPayStructureResponse {
  empId: string;
  empPayStructId: string;
  payStructureId: string;
}

@Injectable({ providedIn: 'root' })
export class EmpPayStructureService {
  private baseUrl = `${environment.apiUrl}/emp-pay-structures`;
  private allAssignments$?: Observable<{ data: EmpPayStructureResponse[]; message: string }>;

  constructor(private http: HttpClient) {}

  assign(data: EmpPayStructureAssign): Observable<{ data: EmpPayStructureResponse; message: string }> {
    return this.http.post<{ data: EmpPayStructureResponse; message: string }>(`${this.baseUrl}/assign`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  getAll(forceRefresh = false): Observable<{ data: EmpPayStructureResponse[]; message: string }> {
    if (!this.allAssignments$ || forceRefresh) {
      this.allAssignments$ = this.http.get<{ data: EmpPayStructureResponse[]; message: string }>(this.baseUrl).pipe(
        catchError((err) => {
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.allAssignments$;
  }

  getByEmpId(empId: string): Observable<{ data: EmpPayStructureResponse; message: string }> {
    return this.http.get<{ data: EmpPayStructureResponse; message: string }>(`${this.baseUrl}/${empId}`);
  }

  update(id: string, data: Partial<EmpPayStructureAssign>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.allAssignments$ = undefined;
  }
}
