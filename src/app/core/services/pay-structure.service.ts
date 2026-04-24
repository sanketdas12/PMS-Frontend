import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PayStructure {
  id?: string;
  salaryComponentId: string;
  employmentTypeId: string;
  calculationType?: 'PERCENTAGE' | 'FIXED';
  calculationBase?: string;
  percentage?: number | null;
  fixedAmount?: number | null;
  isOptional: boolean;
  isActive?: boolean;
}

export interface EmploymentType {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PayStructureService {
  private baseUrl = `${environment.apiUrl}/pay-structures`;
  private empTypeUrl = `${environment.apiUrl}/employment-types`;
  private employmentTypes$?: Observable<EmploymentType[]>;
  private structuresByEmploymentType = new Map<string, Observable<PayStructure[]>>();

  constructor(private http: HttpClient) {}

  // GET /api/employment-types
  getEmploymentTypes(forceRefresh = false): Observable<EmploymentType[]> {
    if (forceRefresh) {
      this.employmentTypes$ = undefined;
    }

    if (!this.employmentTypes$) {
      this.employmentTypes$ = this.http.get<EmploymentType[]>(this.empTypeUrl).pipe(
        catchError(err => {
          this.employmentTypes$ = undefined;
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.employmentTypes$;
  }

  // GET /api/pay-structures/{employmentTypeId}
  getByEmploymentType(employmentTypeId: string, forceRefresh = false): Observable<PayStructure[]> {
    if (forceRefresh) {
      this.structuresByEmploymentType.delete(employmentTypeId);
    }

    const cached = this.structuresByEmploymentType.get(employmentTypeId);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<PayStructure[]>(
      `${this.baseUrl}/employment/${employmentTypeId}`
    ).pipe(
      catchError(err => {
        this.structuresByEmploymentType.delete(employmentTypeId);
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    this.structuresByEmploymentType.set(employmentTypeId, request$);
    return request$;
  }

  // POST /api/pay-structures
  create(data: PayStructure): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.baseUrl, data).pipe(
      tap(() => this.clearCache())
    );
  }

  // PUT /api/pay-structures/{id}
  update(id: string, data: Partial<PayStructure>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  // DELETE /api/pay-structures/{id}
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.employmentTypes$ = undefined;
    this.structuresByEmploymentType.clear();
  }
}
