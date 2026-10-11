import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AddCuisineRequest, AddOperatorRequest, AuditPage, AuditQuery, BreachRecord, CuisineUsage, ModerateReviewRequest, ModerationAction, ModerationList, ModerationStatus, OperatorAccount, OperatorCuisine, RecordBreachRequest } from '../models/operator-settings.models';
import type { IOperatorSettingsService } from './operator-settings.service.contract';

@Injectable()
export class OperatorSettingsService implements IOperatorSettingsService {
  private readonly http = inject(HttpClient);

  cuisines(): Observable<OperatorCuisine[]> {
    return this.http.get<OperatorCuisine[]>('/api/operator/cuisines');
  }

  addCuisine(request: AddCuisineRequest): Observable<OperatorCuisine> {
    return this.http.post<OperatorCuisine>('/api/operator/cuisines', request);
  }

  cuisineUsage(id: string): Observable<CuisineUsage> {
    return this.http.get<CuisineUsage>(`/api/operator/cuisines/${encodeURIComponent(id)}/usage`);
  }

  retireCuisine(id: string): Observable<CuisineUsage> {
    return this.http.post<CuisineUsage>(`/api/operator/cuisines/${encodeURIComponent(id)}/retire`, {});
  }

  breaches(): Observable<BreachRecord[]> {
    return this.http.get<BreachRecord[]>('/api/operator/breaches');
  }

  recordBreach(request: RecordBreachRequest): Observable<BreachRecord> {
    return this.http.post<BreachRecord>('/api/operator/breaches', request);
  }

  operators(): Observable<OperatorAccount[]> {
    return this.http.get<OperatorAccount[]>('/api/operator/accounts');
  }

  addOperator(request: AddOperatorRequest): Observable<OperatorAccount> {
    return this.http.post<OperatorAccount>('/api/operator/accounts', request);
  }

  deactivateOperator(id: string): Observable<OperatorAccount> {
    return this.http.post<OperatorAccount>(`/api/operator/accounts/${encodeURIComponent(id)}/deactivate`, {});
  }

  auditLog(query: AuditQuery): Observable<AuditPage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== '') params = params.set(key, String(value));
    return this.http.get<AuditPage>('/api/operator/audit-log', { params });
  }

  moderation(status: ModerationStatus, q: string): Observable<ModerationList> {
    let params = new HttpParams().set('status', status.toLowerCase());
    if (q) params = params.set('q', q);
    return this.http.get<ModerationList>('/api/operator/reviews', { params });
  }

  moderate(id: string, action: ModerationAction, request: ModerateReviewRequest): Observable<void> {
    return this.http.post<void>(`/api/operator/reviews/${encodeURIComponent(id)}/${action}`, request);
  }
}
