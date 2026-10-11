import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import type { EnquiryDraftView } from '../models/enquiry-draft-view';
import type { EnquiryFormValues } from '../models/enquiry-form-values';
import type { InboxFilter } from '../models/inbox-filter';
import type { InboxPageView } from '../models/inbox-page-view';
import type { ReplyResult } from '../models/reply-result';
import type { SendEnquiryRequest } from '../models/send-enquiry-request';
import type { SentEnquiryView } from '../models/sent-enquiry-view';
import type { ThreadView } from '../models/thread-view';
import { EnquiriesService } from './enquiries.service';

@Injectable()
export class HttpEnquiriesService extends EnquiriesService {
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
