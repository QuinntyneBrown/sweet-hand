import type { Party } from './party';
import type { ContactDetails } from './contact-details';

/**
 * One entry after the original enquiry. Replies carry the text as written;
 * system entries name the event and the page words the sentence (L2-064).
 */
export type ThreadEntryView =
  | { kind: 'reply'; id: string; from: Party; text: string; at: string }
  | { kind: 'declined'; id: string; note: string | null; at: string }
  | { kind: 'closed'; id: string; by: Party | 'system'; at: string }
  | { kind: 'shared'; id: string; by: Party; at: string; contact: ContactDetails | null };
