import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatererRecordView, CaterersPageView, CatererStatusFilter, DecisionResult, OperatorEditRequest, ProfileReviewView, QueueFilter, QueuePageView, RecentChangesPageView, RemoveItemResult, ReportEnquiryView, ReportGroupView, ResolveReportRequest } from '../models/operator-moderation.models';

/**
 * Operator moderation (ADR 0003; docs/detailed-designs/moderation): the review
 * queue, profile decisions, caterer records, recent changes and reports.
 * Every request needs an operator session; decisions answer 409 when the
 * record changed since it was read (L2-046) and 400 with field errors.
 */
export interface IOperatorModerationService {
  queue(query: { kind: QueueFilter | null; page: number }): Observable<QueuePageView>;
  profileReview(catererId: string): Observable<ProfileReviewView>;
  /** Opens the certificate copy: the server answers with a redirect to a link that expires within 5 minutes (L2-040.4). */
  certificateUrl(catererId: string): string;
  approve(catererId: string): Observable<DecisionResult>;
  requestChanges(catererId: string, reason: string): Observable<DecisionResult>;
  approveName(catererId: string): Observable<DecisionResult>;
  rejectName(catererId: string, reason: string): Observable<DecisionResult>;
  caterers(query: { status: CatererStatusFilter | null; q: string; page: number }): Observable<CaterersPageView>;
  caterer(catererId: string): Observable<CatererRecordView>;
  suspend(catererId: string, reason: string): Observable<DecisionResult>;
  reinstate(catererId: string, reason: string): Observable<DecisionResult>;
  remove(catererId: string, reason: string, confirm: string): Observable<DecisionResult>;
  edit(catererId: string, request: OperatorEditRequest): Observable<CatererRecordView>;
  removeItem(catererId: string, item: { kind: 'photo' | 'dish'; id: string }, reason: string): Observable<RemoveItemResult>;
  recentChanges(page: number): Observable<RecentChangesPageView>;
  revert(changeId: string, reason: string): Observable<void>;
  report(reportId: string): Observable<ReportGroupView>;
  resolveReport(reportId: string, request: ResolveReportRequest): Observable<ReportGroupView>;
  openEnquiry(reportId: string, reason: string): Observable<ReportEnquiryView>;
}

export const OPERATOR_MODERATION_SERVICE = new InjectionToken<IOperatorModerationService>('OPERATOR_MODERATION_SERVICE');
