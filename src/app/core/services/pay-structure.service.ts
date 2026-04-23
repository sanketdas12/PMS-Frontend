import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  // GET /api/employment-types
  getEmploymentTypes(): Observable<EmploymentType[]> {
    return this.http.get<EmploymentType[]>(this.empTypeUrl).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // GET /api/pay-structures/{employmentTypeId}
  getByEmploymentType(employmentTypeId: string): Observable<PayStructure[]> {
    return this.http.get<PayStructure[]>(
      `${this.baseUrl}/employment/${employmentTypeId}`
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // POST /api/pay-structures
  create(data: PayStructure): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.baseUrl, data);
  }

  // PUT /api/pay-structures/{id}
  update(id: string, data: Partial<PayStructure>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, data);
  }

  // DELETE /api/pay-structures/{id}
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}