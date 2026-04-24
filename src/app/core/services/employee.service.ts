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
  private employeeByIdCache = new Map<string, Observable<{ data: Employee; message: string }>>();

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<{ data: Employee[]; message: string }> {
    if (!this.allEmployees$ || forceRefresh) {
      console.log('Fetching employee data from API:', this.baseUrl);
      this.allEmployees$ = this.http.get<{ data: Employee[]; message: string }>(this.baseUrl).pipe(
        tap((response) => {
          console.log('Employee API response:', response);
        }),
        catchError((err) => {
          console.error('Error fetching employee data:', err);
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.allEmployees$;
  }

  getById(id: string, forceRefresh = false): Observable<{ data: Employee; message: string }> {
    if (forceRefresh) {
      this.employeeByIdCache.delete(id);
    }

    const cached = this.employeeByIdCache.get(id);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<{ data: Employee; message: string }>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => {
        this.employeeByIdCache.delete(id);
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    this.employeeByIdCache.set(id, request$);
    return request$;
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
    this.employeeByIdCache.clear();
  }
}
