import { InjectionToken } from '@angular/core';
import { type Observable } from 'rxjs';
import type { EnquiryDraftView, EnquiryFormValues, InboxFilter, InboxPageView, ReplyResult, SendEnquiryRequest, SentEnquiryView, ThreadView } from '../models/enquiries.models';

/** Enquiry inboxes and threads for customers and caterers (ADR 0003; docs/detailed-designs/enquiries). */
export interface IEnquiriesService {
  inbox(query: { status: InboxFilter | null; page: number }): Observable<InboxPageView>;
  /** Opening a thread marks it read; the caterer's preview pane passes `markRead: false`. */
  thread(id: string, options?: { markRead?: boolean }): Observable<ThreadView>;
  reply(id: string, text: string): Observable<ReplyResult>;
  decline(id: string, note: string): Observable<ThreadView>;
  close(id: string): Observable<ThreadView>;
  shareContactDetails(id: string): Observable<ThreadView>;
  /** Sends a new enquiry (send-enquiry); refusals arrive as problems with a `code` (`EnquiryRefusal`). */
  send(request: SendEnquiryRequest): Observable<SentEnquiryView>;
  /** The signed-in customer's saved draft for a caterer, or `null` (L2-023.3). */
  draft(catererSlug: string): Observable<EnquiryDraftView | null>;
  saveDraft(catererSlug: string, values: EnquiryFormValues): Observable<void>;
  /** Sends a fresh verification link to the signed-in account (verify-email-and-reset-password design). */
  resendVerificationEmail(): Observable<void>;
}

export const ENQUIRIES_SERVICE = new InjectionToken<IEnquiriesService>('ENQUIRIES_SERVICE');
