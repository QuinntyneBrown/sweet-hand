import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { InboxFilter, InboxPageView, ReplyResult, ThreadView } from './enquiries.models';

/** Enquiry inboxes and threads for customers and caterers (ADR 0003; docs/detailed-designs/enquiries). */
export abstract class EnquiriesApi {
  abstract inbox(query: { status: InboxFilter | null; page: number }): Observable<InboxPageView>;
  /** Opening a thread marks it read; the caterer's preview pane passes `markRead: false`. */
  abstract thread(id: string, options?: { markRead?: boolean }): Observable<ThreadView>;
  abstract reply(id: string, text: string): Observable<ReplyResult>;
  abstract decline(id: string, note: string): Observable<ThreadView>;
  abstract close(id: string): Observable<ThreadView>;
  abstract shareContactDetails(id: string): Observable<ThreadView>;
}

@Injectable()
export class HttpEnquiriesApi extends EnquiriesApi {
  private readonly http = inject(HttpClient);

  inbox(query: { status: InboxFilter | null; page: number }): Observable<InboxPageView> {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.page > 1) params = params.set('page', query.page);
    return this.http.get<InboxPageView>('/api/enquiries', { params });
  }

  thread(id: string, options: { markRead?: boolean } = {}): Observable<ThreadView> {
    const params = options.markRead === false ? new HttpParams().set('markRead', 'false') : undefined;
    return this.http.get<ThreadView>(`/api/enquiries/${encodeURIComponent(id)}`, { params });
  }

  reply(id: string, text: string): Observable<ReplyResult> {
    return this.http.post<ReplyResult>(`/api/enquiries/${encodeURIComponent(id)}/messages`, { text });
  }

  decline(id: string, note: string): Observable<ThreadView> {
    return this.http.post<ThreadView>(`/api/enquiries/${encodeURIComponent(id)}/decline`, { note });
  }

  close(id: string): Observable<ThreadView> {
    return this.http.post<ThreadView>(`/api/enquiries/${encodeURIComponent(id)}/close`, {});
  }

  shareContactDetails(id: string): Observable<ThreadView> {
    return this.http.post<ThreadView>(`/api/enquiries/${encodeURIComponent(id)}/contact-shares`, {});
  }
}
