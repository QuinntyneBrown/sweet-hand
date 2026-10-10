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
