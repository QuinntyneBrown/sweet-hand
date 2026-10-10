import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import type { EnquiryDraftView, EnquiryFormValues, InboxFilter, InboxPageView, ReplyResult, SendEnquiryRequest, SentEnquiryView, ThreadView } from './enquiries.models';

/** Enquiry inboxes and threads for customers and caterers (ADR 0003; docs/detailed-designs/enquiries). */
export abstract class EnquiriesApi {
  abstract inbox(query: { status: InboxFilter | null; page: number }): Observable<InboxPageView>;
  /** Opening a thread marks it read; the caterer's preview pane passes `markRead: false`. */
  abstract thread(id: string, options?: { markRead?: boolean }): Observable<ThreadView>;
  abstract reply(id: string, text: string): Observable<ReplyResult>;
  abstract decline(id: string, note: string): Observable<ThreadView>;
  abstract close(id: string): Observable<ThreadView>;
  abstract shareContactDetails(id: string): Observable<ThreadView>;
  /** Sends a new enquiry (send-enquiry); refusals arrive as problems with a `code` (`EnquiryRefusal`). */
  abstract send(request: SendEnquiryRequest): Observable<SentEnquiryView>;
  /** The signed-in customer's saved draft for a caterer, or `null` (L2-023.3). */
  abstract draft(catererSlug: string): Observable<EnquiryDraftView | null>;
  abstract saveDraft(catererSlug: string, values: EnquiryFormValues): Observable<void>;
  /** Sends a fresh verification link to the signed-in account (verify-email-and-reset-password design). */
  abstract resendVerificationEmail(): Observable<void>;
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

  send(request: SendEnquiryRequest): Observable<SentEnquiryView> {
    return this.http.post<SentEnquiryView>('/api/enquiries', request);
  }

  draft(catererSlug: string): Observable<EnquiryDraftView | null> {
    return this.http
      .get<EnquiryDraftView>(`/api/enquiries/drafts/${encodeURIComponent(catererSlug)}`, { observe: 'response' })
      .pipe(map((res) => (res.status === 200 ? res.body : null)));
  }

  saveDraft(catererSlug: string, values: EnquiryFormValues): Observable<void> {
    return this.http.put<void>(`/api/enquiries/drafts/${encodeURIComponent(catererSlug)}`, values);
  }

  resendVerificationEmail(): Observable<void> {
    return this.http.post<void>('/api/identity/email-verifications/resend', {});
  }
}
