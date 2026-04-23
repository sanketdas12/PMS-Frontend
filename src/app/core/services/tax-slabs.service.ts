import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaxSlab {
  id?: string;
  minIncome: number;
  maxIncome: number;
  taxPercentage: number;
  financialYear: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaxSlabService {

  private baseUrl = `${environment.apiUrl}/tax-slabs`;
  private allTaxSlabs$?: Observable<TaxSlab[]>;

  constructor(private http: HttpClient) {}

  // getAll(financialYear?: string, forceRefresh = false): Observable<TaxSlab[]> {
  //   if (financialYear) {
  //     return this.http.get<TaxSlab[]>(`${this.baseUrl}?financialYear=${financialYear}`);
  //   }

  //   if (!this.allTaxSlabs$ || forceRefresh) {
  //     this.allTaxSlabs$ = this.http.get<TaxSlab[]>(this.baseUrl).pipe(
  //       catchError((err) => {
  //         this.clearCache();
  //         return throwError(() => err);
  //       }),
  //       shareReplay(1)
  //     );
  //   }

  //   return this.allTaxSlabs$;
  // }

    getAll(financialYear?: string, forceRefresh = false): Observable<TaxSlab[]> {
    if (financialYear) {
      // always fresh, no cache needed for parameterized calls
      return this.http.get<TaxSlab[]>(`${this.baseUrl}?financialYear=${financialYear}`);
    }

    // if no financialYear, you're hitting a 401 — either always require it,
    // or fall back to a default year. Best option:
    throw new Error('financialYear is required to fetch tax slabs');
  }

  getById(id: string): Observable<TaxSlab> {
    return this.http.get<TaxSlab>(`${this.baseUrl}/${id}`);
  }

  create(data: { minIncome: number; maxIncome: number; taxPercentage: number; financialYear: string }): Observable<TaxSlab> {
    return this.http.post<TaxSlab>(this.baseUrl, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: string, data: { minIncome: number; maxIncome: number; taxPercentage: number; financialYear: string }): Observable<TaxSlab> {
    return this.http.put<TaxSlab>(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.allTaxSlabs$ = undefined;
  }
}
