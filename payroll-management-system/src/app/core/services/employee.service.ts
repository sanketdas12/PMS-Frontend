import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Employee {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  designation?: string;
  employmentType?: string;
  status?: string;
  joiningDate?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = `${environment.apiUrl}/employees`;
  private allEmployees$?: Observable<{ data: Employee[]; message: string }>;

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<{ data: Employee[]; message: string }> {
    if (!this.allEmployees$ || forceRefresh) {
      this.allEmployees$ = this.http.get<{ data: Employee[]; message: string }>(this.baseUrl).pipe(
        catchError((err) => {
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.allEmployees$;
  }

  getById(id: string): Observable<{ data: Employee; message: string }> {
    return this.http.get<{ data: Employee; message: string }>(`${this.baseUrl}/${id}`);
  }

  create(emp: Partial<Employee>): Observable<any> {
    return this.http.post<any>(this.baseUrl, emp).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: string, emp: Partial<Employee>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, emp).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.allEmployees$ = undefined;
  }
}
