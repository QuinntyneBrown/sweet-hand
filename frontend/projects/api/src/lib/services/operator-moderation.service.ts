import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CatererRecordView, CaterersPageView, CatererStatusFilter, DecisionResult, OperatorEditRequest, ProfileReviewView, QueueFilter, QueuePageView, RecentChangesPageView, RemoveItemResult, ReportEnquiryView, ReportGroupView, ResolveReportRequest } from '../models/operator-moderation.models';
import type { IOperatorModerationService } from './operator-moderation.service.contract';

@Injectable()
export class OperatorModerationService implements IOperatorModerationService {
  private readonly http = inject(HttpClient);

  queue(query: { kind: QueueFilter | null; page: number }): Observable<QueuePageView> {
    let params = new HttpParams();
    if (query.kind) params = params.set('kind', query.kind);
    if (query.page > 1) params = params.set('page', query.page);
    return this.http.get<QueuePageView>('/api/operator/queue', { params });
  }

  profileReview(catererId: string): Observable<ProfileReviewView> {
    return this.http.get<ProfileReviewView>(`/api/operator/queue/profiles/${encodeURIComponent(catererId)}`);
  }

  certificateUrl(catererId: string): string {
    return `/api/operator/profiles/${encodeURIComponent(catererId)}/certificate-file`;
  }

  approve(catererId: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/approve`, {});
  }

  requestChanges(catererId: string, reason: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/request-changes`, { reason });
  }

  approveName(catererId: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/name/approve`, {});
  }

  rejectName(catererId: string, reason: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/name/request-changes`, { reason });
  }

  caterers(query: { status: CatererStatusFilter | null; q: string; page: number }): Observable<CaterersPageView> {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.q) params = params.set('q', query.q);
    if (query.page > 1) params = params.set('page', query.page);
    return this.http.get<CaterersPageView>('/api/operator/caterers', { params });
  }

  caterer(catererId: string): Observable<CatererRecordView> {
    return this.http.get<CatererRecordView>(`/api/operator/caterers/${encodeURIComponent(catererId)}`);
  }

  suspend(catererId: string, reason: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/suspend`, { reason });
  }

  reinstate(catererId: string, reason: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/reinstate`, { reason });
  }

  remove(catererId: string, reason: string, confirm: string): Observable<DecisionResult> {
    return this.http.post<DecisionResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/remove`, { reason, confirm });
  }

  edit(catererId: string, request: OperatorEditRequest): Observable<CatererRecordView> {
    return this.http.patch<CatererRecordView>(`/api/operator/profiles/${encodeURIComponent(catererId)}`, request);
  }

  removeItem(catererId: string, item: { kind: 'photo' | 'dish'; id: string }, reason: string): Observable<RemoveItemResult> {
    const collection = item.kind === 'photo' ? 'photos' : 'menu-items';
    return this.http.delete<RemoveItemResult>(`/api/operator/profiles/${encodeURIComponent(catererId)}/${collection}/${encodeURIComponent(item.id)}`, { body: { reason } });
  }

  recentChanges(page: number): Observable<RecentChangesPageView> {
    const params = page > 1 ? new HttpParams().set('page', page) : new HttpParams();
    return this.http.get<RecentChangesPageView>('/api/operator/recent-changes', { params });
  }

  revert(changeId: string, reason: string): Observable<void> {
    return this.http.post<void>(`/api/operator/recent-changes/${encodeURIComponent(changeId)}/revert`, { reason });
  }

  report(reportId: string): Observable<ReportGroupView> {
    return this.http.get<ReportGroupView>(`/api/operator/reports/${encodeURIComponent(reportId)}`);
  }

  resolveReport(reportId: string, request: ResolveReportRequest): Observable<ReportGroupView> {
    return this.http.post<ReportGroupView>(`/api/operator/reports/${encodeURIComponent(reportId)}/resolve`, request);
  }

  openEnquiry(reportId: string, reason: string): Observable<ReportEnquiryView> {
    return this.http.post<ReportEnquiryView>(`/api/operator/reports/${encodeURIComponent(reportId)}/enquiry`, { reason });
  }
}
