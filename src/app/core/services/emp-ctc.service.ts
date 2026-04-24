import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeeCTC {
  empCtcId: string;
  empId: string;
  employeeName: string;
  ctc: number;
  isActive: boolean;
}

export interface CreateCTCRequest {
  empId: string;
  ctc: number;
}

export interface UpdateCTCRequest {
  empId: string;
  ctc: number;
}

export interface CreateCTCResponse {
  empCtcId: string;
  empId: string;
  employeeName: string;
  ctc: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmpCtcService {
  private baseUrl = `${environment.apiUrl}/employee-ctc`;
  private allCtcs$?: Observable<EmployeeCTC[]>;

  constructor(private http: HttpClient) {}

  /**
   * Get all employee CTC
   */
  getAll(forceRefresh = false): Observable<EmployeeCTC[]> {
    if (!this.allCtcs$ || forceRefresh) {
      this.allCtcs$ = this.http.get<EmployeeCTC[]>(this.baseUrl).pipe(
        catchError((err) => {
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }
    return this.allCtcs$;
  }

  /**
   * Create CTC for an employee
   */
  create(request: CreateCTCRequest): Observable<CreateCTCResponse> {
    return this.http.post<CreateCTCResponse>(this.baseUrl, request).pipe(
      tap(() => {
        this.clearCache();
      }),
      catchError((err) => {
        console.error('Error creating CTC:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Update CTC using empCtcId
   */
  update(empCtcId: string, request: UpdateCTCRequest): Observable<CreateCTCResponse> {
    return this.http.put<CreateCTCResponse>(`${this.baseUrl}/${empCtcId}`, request).pipe(
      tap(() => {
        this.clearCache();
      }),
      catchError((err) => {
        console.error('Error updating CTC:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Create or update CTC (legacy method for backward compatibility)
   */
  createOrUpdate(request: CreateCTCRequest): Observable<CreateCTCResponse> {
    return this.create(request);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.allCtcs$ = undefined;
  }
}
