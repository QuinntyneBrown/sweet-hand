import type { Request, Reply } from '../http/router.ts';
import { ok } from '../http/problems.ts';
import { currentUser } from '../identity/sessions.ts';
import type { EnquiryStatus } from '@contract/enquiry-status.ts';
import type { InboxFilter } from '@contract/inbox-filter.ts';
import type { InboxPageView } from '@contract/inbox-page-view.ts';
import { enquiriesOf, isUnread } from './rules.ts';
import { partiesOf, rowView } from './views.ts';

const PAGE_SIZE = 20;
const FILTERS: Record<InboxFilter, EnquiryStatus> = { open: 'Open', replied: 'Replied', declined: 'Declined', closed: 'Closed' };

/** GET /api/enquiries: one page of the caller's inbox, newest activity first (browse-inbox design, L2-031). */
export async function browseInbox(req: Request): Promise<Reply> {
  const all = await enquiriesOf(req.tx, currentUser(req));
  // Unknown filters are ignored and out-of-range pages fall back to page 1 (browse-inbox design).
  const status = Object.hasOwn(FILTERS, req.query.get('status') ?? '') ? FILTERS[req.query.get('status') as InboxFilter] : undefined;
  const matching = status ? all.filter((x) => x.e.status === status) : all;
  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const requested = Number(req.query.get('page') ?? '1');
  const page = Number.isInteger(requested) && requested >= 1 && requested <= pageCount ? requested : 1;
  const count = (s: EnquiryStatus) => all.filter((x) => x.e.status === s).length;
  const items = [];
  for (const { e, party } of matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)) items.push(rowView(e, await partiesOf(req.tx, e), party));
  const view: InboxPageView = {
    items,
    total: matching.length,
    page,
    pageSize: PAGE_SIZE,
    pageCount,
    counts: { all: all.length, open: count('Open'), replied: count('Replied'), declined: count('Declined'), closed: count('Closed') },
    unread: all.filter(({ e, party }) => isUnread(e, party)).length,
  };
  return ok(view);
}
