import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  AddCuisineRequest,
  AddOperatorRequest,
  AuditPage,
  AuditQuery,
  BreachRecord,
  CuisineUsage,
  ModerateReviewRequest,
  ModerationAction,
  ModerationList,
  ModerationStatus,
  OperatorAccount,
  OperatorCuisine,
  RecordBreachRequest,
} from './operator-settings.models';

/**
 * The operator console's settings and moderation screens: cuisine list
 * (manage-cuisine-list), breach register (locate-data-and-record-breaches),
 * operator accounts (manage-operator-accounts), audit log (query-audit-log)
 * and held or hidden reviews (moderate-reviews). Admin-only reads answer 403
 * with an `AdminOnlyProblem` for other operators (L2-056.5).
 */
export abstract class OperatorSettingsApi {
  /** Every cuisine, active and retired, A to Z. */
  abstract cuisines(): Observable<OperatorCuisine[]>;
  /** 400 with `errors.name` for a duplicate or a name outside 2–40 characters. */
  abstract addCuisine(request: AddCuisineRequest): Observable<OperatorCuisine>;
  /** The published caterers that use a cuisine. */
  abstract cuisineUsage(id: string): Observable<CuisineUsage>;
  /** Permanent; the caterers that use it keep it and are returned. */
  abstract retireCuisine(id: string): Observable<CuisineUsage>;

  /** Newest first. */
  abstract breaches(): Observable<BreachRecord[]>;
  abstract recordBreach(request: RecordBreachRequest): Observable<BreachRecord>;

  /** Admin only. */
  abstract operators(): Observable<OperatorAccount[]>;
  /** Admin only: sends a 24-hour invitation. */
  abstract addOperator(request: AddOperatorRequest): Observable<OperatorAccount>;
  /** Admin only: ends the operator's sessions within 60 seconds (L2-056.4). */
  abstract deactivateOperator(id: string): Observable<OperatorAccount>;

  /** Admin only: newest first. */
  abstract auditLog(query: AuditQuery): Observable<AuditPage>;

  abstract moderation(status: ModerationStatus, q: string): Observable<ModerationList>;
  abstract moderate(id: string, action: ModerationAction, request: ModerateReviewRequest): Observable<void>;
}

@Injectable()
export class HttpOperatorSettingsApi extends OperatorSettingsApi {
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
