import { roles, signedIn, type Area } from '../http/router.ts';
import { sendEnquiry } from './send.ts';
import { getDraft, saveDraft } from './drafts.ts';
import { contributeSessionCounters } from '../identity/session-view.ts';
import { browseInbox } from './inbox.ts';
import { closeEnquiry, declineEnquiry, openThread, postReply, shareContact } from './thread.ts';
import { unreadThreads } from './rules.ts';

// The header badge counts threads with something unread (L2-029.1).
contributeSessionCounters({ unread: unreadThreads });

const parties = roles('Customer', 'Caterer');

/** Enquiry endpoints (docs/detailed-designs/enquiries). Only the two parties of an enquiry see it (L2-034). */
export const enquiriesArea: Area = (r) => {
  r.get('/api/enquiries', parties, browseInbox);
  // Any signed-in role, so other roles hear "customer accounts only" in the form's words (L2-023.4).
  r.post('/api/enquiries', signedIn, sendEnquiry);
  r.get('/api/enquiries/drafts/:caterer', roles('Customer'), getDraft);
  r.put('/api/enquiries/drafts/:caterer', roles('Customer'), saveDraft);
  r.get('/api/enquiries/:id', parties, openThread);
  r.post('/api/enquiries/:id/messages', parties, postReply);
  r.post('/api/enquiries/:id/decline', parties, declineEnquiry);
  r.post('/api/enquiries/:id/close', parties, closeEnquiry);
  r.post('/api/enquiries/:id/contact-shares', parties, shareContact);
};
