import type { Observable } from 'rxjs';
import type { CatererRecordView, CaterersPageView, CatererStatusFilter, DecisionResult, OperatorEditRequest, ProfileReviewView, QueueFilter, QueuePageView, RecentChangesPageView, RemoveItemResult, ReportEnquiryView, ReportGroupView, ResolveReportRequest } from '../models/operator-moderation.models';

/**
 * Operator moderation (ADR 0003; docs/detailed-designs/moderation): the review
 * queue, profile decisions, caterer records, recent changes and reports.
 * Every request needs an operator session; decisions answer 409 when the
 * record changed since it was read (L2-046) and 400 with field errors.
 */
export abstract class OperatorModerationService {
  abstract queue(query: { kind: QueueFilter | null; page: number }): Observable<QueuePageView>;
  abstract profileReview(catererId: string): Observable<ProfileReviewView>;
  /** Opens the certificate copy: the server answers with a redirect to a link that expires within 5 minutes (L2-040.4). */
  abstract certificateUrl(catererId: string): string;
  abstract approve(catererId: string): Observable<DecisionResult>;
  abstract requestChanges(catererId: string, reason: string): Observable<DecisionResult>;
  abstract approveName(catererId: string): Observable<DecisionResult>;
  abstract rejectName(catererId: string, reason: string): Observable<DecisionResult>;
  abstract caterers(query: { status: CatererStatusFilter | null; q: string; page: number }): Observable<CaterersPageView>;
  abstract caterer(catererId: string): Observable<CatererRecordView>;
  abstract suspend(catererId: string, reason: string): Observable<DecisionResult>;
  abstract reinstate(catererId: string, reason: string): Observable<DecisionResult>;
  abstract remove(catererId: string, reason: string, confirm: string): Observable<DecisionResult>;
  abstract edit(catererId: string, request: OperatorEditRequest): Observable<CatererRecordView>;
  abstract removeItem(catererId: string, item: { kind: 'photo' | 'dish'; id: string }, reason: string): Observable<RemoveItemResult>;
  abstract recentChanges(page: number): Observable<RecentChangesPageView>;
  abstract revert(changeId: string, reason: string): Observable<void>;
  abstract report(reportId: string): Observable<ReportGroupView>;
  abstract resolveReport(reportId: string, request: ResolveReportRequest): Observable<ReportGroupView>;
  abstract openEnquiry(reportId: string, reason: string): Observable<ReportEnquiryView>;
}
