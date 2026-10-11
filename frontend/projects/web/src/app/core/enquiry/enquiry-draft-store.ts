import { Injectable } from '@angular/core';
import type { EnquiryFormValues } from '../api/enquiries.models';
import { RESUME_PARAM, RESUME_VALUE } from './enquiry-launcher';

/** A visitor's unsent enquiry, kept while they sign in or register (send-enquiry design, `EnquiryDraftStore`). */
export interface LocalEnquiryDraft {
  caterer: { slug: string; name: string; photo: string };
  values: EnquiryFormValues;
  savedAt: number;
}

const KEY = 'sh.enquiry-draft';
/** Drafts are kept for 24 hours (docs/mocks/dialogs/enquiry/restored). */
const KEPT_MS = 24 * 60 * 60 * 1000;

/**
 * Holds one visitor draft in memory and mirrors it to session storage, so a
 * reload on the way through sign-in keeps it. Storage may be unavailable;
 * memory still carries the draft through the in-app sign-in.
 */
@Injectable({ providedIn: 'root' })
export class EnquiryDraftStore {
  private draft: LocalEnquiryDraft | null = null;

  save(draft: Omit<LocalEnquiryDraft, 'savedAt'>): void {
    this.draft = { ...draft, savedAt: Date.now() };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(this.draft));
    } catch {
      // Private mode or blocked storage: memory is enough for the round trip.
    }
  }

  /** The draft for this caterer, if one was saved in the last 24 hours. */
  get(slug: string): LocalEnquiryDraft | null {
    const draft = this.draft ?? this.read();
    if (!draft || draft.caterer.slug !== slug || Date.now() - draft.savedAt > KEPT_MS) return null;
    return draft;
  }

  clear(): void {
    this.draft = null;
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Nothing to clear.
    }
  }

  /** The draft a sign-in return address leads back to: `/caterers/:slug?enquiry=resume` (L2-013.3). */
  forReturnUrl(returnUrl: string | null | undefined): LocalEnquiryDraft | null {
    const match = /^\/caterers\/([^/?#]+)\?(.*)$/.exec(returnUrl ?? '');
    if (!match || new URLSearchParams(match[2]).get(RESUME_PARAM) !== RESUME_VALUE) return null;
    return this.get(decodeURIComponent(match[1]));
  }

  private read(): LocalEnquiryDraft | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as LocalEnquiryDraft) : null;
    } catch {
      return null;
    }
  }
}
