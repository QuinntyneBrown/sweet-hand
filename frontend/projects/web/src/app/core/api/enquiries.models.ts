/** Wire types for enquiry inboxes and threads (ADR 0003). Shared with the fake backend; keep import-free. */

export type EnquiryStatus = 'Open' | 'Replied' | 'Declined' | 'Closed';

/** The status filter of an inbox, as it appears in the URL (`?status=open`). */
export type InboxFilter = 'open' | 'replied' | 'declined' | 'closed';

export type Party = 'customer' | 'caterer';

/** The other party of an enquiry: the caterer for a customer, the customer for a caterer, or a deleted account (L2-072.2). */
export type OtherParty =
  | { kind: 'caterer'; name: string; slug: string; photo: string }
  | { kind: 'customer'; name: string; firstName: string; initials: string }
  | { kind: 'former' };

export interface InboxRowView {
  /** Random UUID (L2-034.2). */
  id: string;
  otherParty: OtherParty;
  /** YYYY-MM-DD in Toronto. */
  eventDate: string;
  guests: number;
  occasion: string;
  status: EnquiryStatus;
  lastActivityAt: string;
  unread: boolean;
}

export interface InboxCounts {
  all: number;
  open: number;
  replied: number;
  declined: number;
  closed: number;
}

export interface InboxPageView {
  items: InboxRowView[];
  /** Enquiries that match the filter. */
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Enquiries per status, ignoring the filter. */
  counts: InboxCounts;
  /** Threads with something unread (L2-029). */
  unread: number;
}

export interface ContactDetails {
  /** The customer's name or the caterer's business name. */
  name: string;
  email: string;
  phone: string | null;
}

/**
 * One entry after the original enquiry. Replies carry the text as written;
 * system entries name the event and the page words the sentence (L2-064).
 */
export type ThreadEntryView =
  | { kind: 'reply'; id: string; from: Party; text: string; at: string }
  | { kind: 'declined'; id: string; note: string | null; at: string }
  | { kind: 'closed'; id: string; by: Party | 'system'; at: string }
  | { kind: 'shared'; id: string; by: Party; at: string; contact: ContactDetails | null };

export interface FitWarning {
  kind: 'area' | 'guests';
  /** Area name for an `area` warning. */
  area?: string;
  /** The caterer's guest range for a `guests` warning. */
  min?: number;
  max?: number;
}

export interface ThreadView {
  id: string;
  viewer: Party;
  status: EnquiryStatus;
  caterer: { name: string; slug: string; photo: string };
  /** `null` once the customer deleted their account (L2-072.2). */
  customer: { name: string; firstName: string; initials: string } | null;
  eventDate: string;
  guests: number;
  area: string;
  /** First three characters of the event postal code, when given. */
  fsa: string | null;
  occasion: string;
  /** The original enquiry message and when it was sent. */
  message: string;
  sentAt: string;
  /** Shown to the caterer when the enquiry falls outside what they take on (L2-024.3). */
  fitWarnings: FitWarning[];
  entries: ThreadEntryView[];
  /** The viewer's own details, shown in the share dialog before they share. */
  myContact: ContactDetails;
  sharedByMe: boolean;
  /** Set when the event has passed and the enquiry will close automatically (L2-033.4). */
  closesOn: string | null;
}

export interface ReplyResult {
  entry: Extract<ThreadEntryView, { kind: 'reply' }>;
  status: EnquiryStatus;
  /** The notification email is queued behind a slow mail service (L2-030.1). */
  emailDelayed: boolean;
}

// ---------- Sending an enquiry (send-enquiry and limit-enquiry-abuse designs) ----------

/** What the enquiry form holds, as typed; also the shape of a saved draft (L2-023.1). */
export interface EnquiryFormValues {
  /** YYYY-MM-DD, or '' when not chosen. */
  eventDate: string;
  /** As typed, so "fifty" survives a round trip and is reported (L2-022.4). */
  guests: string;
  /** Service area id (L2-010). */
  area: string;
  postalCode: string;
  /** Occasion id (L2-021). */
  occasion: string;
  message: string;
}

/** `POST /api/enquiries`. The server checks every field again (L2-022.6). */
export interface SendEnquiryRequest extends EnquiryFormValues {
  catererSlug: string;
  /** Bot protection (L2-025.4, L2-082.2). */
  challengeToken: string;
}

/** 201 body: what the confirmation shows (L2-022.1). */
export interface SentEnquiryView {
  id: string;
  caterer: { name: string; slug: string };
  /** Who reads it at the caterer: the owner's first name, or the business name. */
  contactName: string;
  eventDate: string;
  guests: number;
  /** Area and occasion names. */
  area: string;
  occasion: string;
  /** The email provider is down; the notification is queued (L2-030.1). */
  emailQueued: boolean;
}

/**
 * Why a send was refused, carried as `code` in the problem body. The form words
 * each one; the server's `title` is for logs. A duplicate also carries `enquiryId`.
 */
export type EnquiryRefusal = 'customer-only' | 'email-unverified' | 'challenge-failed' | 'daily-limit' | 'new-account-limit' | 'duplicate';

/** `GET /api/enquiries/drafts/:caterer`: the signed-in customer's unsent values, kept for 24 hours (L2-023.3). */
export interface EnquiryDraftView {
  values: EnquiryFormValues;
  savedAt: string;
}
