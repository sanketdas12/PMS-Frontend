import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { SalaryComponent } from '../../shared/models/salary.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SalaryComponentService {

  private baseUrl = `${environment.apiUrl}`;
  private allSalaryComponents$?: Observable<SalaryComponent[]>;

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<SalaryComponent[]> {
    if (!this.allSalaryComponents$ || forceRefresh) {
      this.allSalaryComponents$ = this.http.get<SalaryComponent[]>(`${this.baseUrl}/salary-components`).pipe(
        catchError((err) => {
          this.clearCache();
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    }

    return this.allSalaryComponents$;
  }

  getById(id: string): Observable<SalaryComponent> {
    return this.http.get<SalaryComponent>(`${this.baseUrl}/salary-components/${id}`);
  }

  create(data: Partial<SalaryComponent>): Observable<SalaryComponent> {
    return this.http.post<SalaryComponent>(
      `${this.baseUrl}/salary-components`,
      JSON.stringify(data)   // ← explicitly stringify
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: string, data: Partial<SalaryComponent>): Observable<SalaryComponent> {
    return this.http.put<SalaryComponent>(
      `${this.baseUrl}/salary-components/${id}`,
      JSON.stringify(data)   // ← explicitly stringify
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/salary-components/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.allSalaryComponents$ = undefined;
  }
}
