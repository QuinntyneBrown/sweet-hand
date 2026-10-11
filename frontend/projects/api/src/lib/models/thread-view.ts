import type { Party } from './party';
import type { EnquiryStatus } from './enquiry-status';
import type { FitWarning } from './fit-warning';
import type { ThreadEntryView } from './thread-entry-view';
import type { ContactDetails } from './contact-details';

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
