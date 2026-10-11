import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AddCuisineRequest, AddOperatorRequest, AuditPage, AuditQuery, BreachRecord, CuisineUsage, ModerateReviewRequest, ModerationAction, ModerationList, ModerationStatus, OperatorAccount, OperatorCuisine, RecordBreachRequest } from '../models/operator-settings.models';

/**
 * The operator console's settings and moderation screens: cuisine list
 * (manage-cuisine-list), breach register (locate-data-and-record-breaches),
 * operator accounts (manage-operator-accounts), audit log (query-audit-log)
 * and held or hidden reviews (moderate-reviews). Admin-only reads answer 403
 * with an `AdminOnlyProblem` for other operators (L2-056.5).
 */
export interface IOperatorSettingsService {
  /** Every cuisine, active and retired, A to Z. */
  cuisines(): Observable<OperatorCuisine[]>;
  /** 400 with `errors.name` for a duplicate or a name outside 2–40 characters. */
  addCuisine(request: AddCuisineRequest): Observable<OperatorCuisine>;
  /** The published caterers that use a cuisine. */
  cuisineUsage(id: string): Observable<CuisineUsage>;
  /** Permanent; the caterers that use it keep it and are returned. */
  retireCuisine(id: string): Observable<CuisineUsage>;

  /** Newest first. */
  breaches(): Observable<BreachRecord[]>;
  recordBreach(request: RecordBreachRequest): Observable<BreachRecord>;

  /** Admin only. */
  operators(): Observable<OperatorAccount[]>;
  /** Admin only: sends a 24-hour invitation. */
  addOperator(request: AddOperatorRequest): Observable<OperatorAccount>;
  /** Admin only: ends the operator's sessions within 60 seconds (L2-056.4). */
  deactivateOperator(id: string): Observable<OperatorAccount>;

  /** Admin only: newest first. */
  auditLog(query: AuditQuery): Observable<AuditPage>;

  moderation(status: ModerationStatus, q: string): Observable<ModerationList>;
  moderate(id: string, action: ModerationAction, request: ModerateReviewRequest): Observable<void>;
}

export const OPERATOR_SETTINGS_SERVICE = new InjectionToken<IOperatorSettingsService>('OPERATOR_SETTINGS_SERVICE');
