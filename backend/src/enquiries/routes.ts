import { roles, type Area } from '../http/router.ts';
import { contributeSessionCounters } from '../identity/session-view.ts';
import { browseInbox } from './inbox.ts';
import { closeEnquiry, declineEnquiry, openThread, postReply } from './thread.ts';
import { unreadThreads } from './rules.ts';

// The header badge counts threads with something unread (L2-029.1).
contributeSessionCounters({ unread: unreadThreads });

const parties = roles('Customer', 'Caterer');

/** Enquiry endpoints (docs/detailed-designs/enquiries). Only the two parties of an enquiry see it (L2-034). */
export const enquiriesArea: Area = (r) => {
  r.get('/api/enquiries', parties, browseInbox);
  r.get('/api/enquiries/:id', parties, openThread);
  r.post('/api/enquiries/:id/messages', parties, postReply);
  r.post('/api/enquiries/:id/decline', parties, declineEnquiry);
  r.post('/api/enquiries/:id/close', parties, closeEnquiry);
};
