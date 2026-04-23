import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RevisionType {
  id: string;
  revisionName: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RevisionTypeService {
  private baseUrl = `${environment.apiUrl}/revision-types`;
  private cache$?: Observable<RevisionType[]>;

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<RevisionType[]> {
    if (forceRefresh) this.cache$ = undefined;

    if (!this.cache$) {
      this.cache$ = this.http.get<RevisionType[]>(this.baseUrl).pipe(
        catchError((err) => {
          this.cache$ = undefined;
          return throwError(() => err);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  getById(id: string): Observable<RevisionType> {
    return this.http.get<RevisionType>(`${this.baseUrl}/${id}`);
  }

  create(data: { revisionName: string; category: string }): Observable<RevisionType> {
    return this.http.post<RevisionType>(this.baseUrl, data).pipe(
      tap(() => this.cache$ = undefined)
    );
  }

  update(id: string, data: { revisionName: string; category: string }): Observable<RevisionType> {
    return this.http.put<RevisionType>(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.cache$ = undefined)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.cache$ = undefined)
    );
  }
}