import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PayStructure {
  id?: string;
  salaryComponentId: string;
  employmentTypeId: string;
  calculationType: 'PERCENTAGE' | 'FIXED';
  calculationBase?: string;
  percentage?: number | null;
  fixedAmount?: number | null;
  isOptional: boolean;
}

export interface PayStructureResponse {
  id?:              string;
  salaryComponentId: string;
  employmentTypeId:  string;
  calculationType?:  'PERCENTAGE' | 'FIXED';  // add ? here
  calculationBase?:  string;
  percentage:        number | null;
  fixedAmount:       number | null;
  isOptional:        boolean;
  isActive:          boolean;
}

@Injectable({ providedIn: 'root' })
export class PayStructureService {

  private baseUrl = `${environment.apiUrl}/pay-structures`;
  private allPayStructures$?: Observable<PayStructureResponse[]>;

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<PayStructureResponse[]> {
    if (!this.allPayStructures$ || forceRefresh) {
      this.allPayStructures$ = this.http.get<PayStructureResponse[]>(this.baseUrl).pipe(
        catchError((err) => {
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.allPayStructures$;
  }

  getById(id: string): Observable<PayStructureResponse[]> {
    return this.http.get<PayStructureResponse[]>(`${this.baseUrl}/${id}`);
  }

  create(data: PayStructure): Observable<any> {
    return this.http.post<any>(this.baseUrl, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: string, data: Partial<PayStructure>): Observable<any> {
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
    this.allPayStructures$ = undefined;
  }
}
