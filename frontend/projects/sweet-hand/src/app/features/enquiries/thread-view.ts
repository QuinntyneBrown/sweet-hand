/**
 * What a thread shows each party: names, the order and wording of entries,
 * which actions apply and how the thread ends (reply-in-thread,
 * decline-or-close-enquiry and share-contact-details designs; message CRD).
 */
import { graphemeLength, type ThreadParty } from '@sweet-hand/components';
import { count, longDate, shortDate, time, torontoToday } from '../../core/format/format';
import { FORMER_USER, messageTime } from './enquiry-text';
import { type ContactDetails, type FitWarning, type ThreadEntryView, type ThreadView } from '@sweet-hand/api';

export const REPLY_MAX = 2000;
export const NOTE_MAX = 500;

export interface EntryVm {
  id: string;
  kind: 'theirs' | 'mine' | 'system';
  sender: string | null;
  text: string;
  time: string;
  datetime: string;
  contact: { title: string; email: string; phone: string | null } | null;
}

/** A reply is 1 to 2,000 characters of plain text (L2-032.2); the message says by how much it is over. */
export function replyError(text: string): string | null {
  if (!text.trim()) return $localize`:@@thread.replyEmpty:Write a reply before sending`;
  const n = graphemeLength(text);
  if (n > REPLY_MAX) return $localize`:@@thread.replyTooLong:Keep your reply under 2,000 characters. It’s ${count(n)}:count: now.`;
  return null;
}

/** The decline note is optional and at most 500 characters (L2-033). */
export function noteError(text: string): string | null {
  return graphemeLength(text.trim()) > NOTE_MAX ? $localize`:@@decline.noteTooLong:Keep your note under 500 characters` : null;
}

/** The other party's name: the business for a customer, the person (or "Former Sweet Hand user") for a caterer. */
export function otherName(t: ThreadView): string {
  return t.viewer === 'customer' ? t.caterer.name : (t.customer?.name ?? FORMER_USER());
}

/** How the other party is addressed in short copy: "Pelau House", "Priya". */
export function otherShortName(t: ThreadView): string {
  return t.viewer === 'customer' ? t.caterer.name : (t.customer?.firstName ?? FORMER_USER());
}

export function partyPicture(t: ThreadView): ThreadParty {
  if (t.viewer === 'customer') return { kind: 'photo', src: t.caterer.photo };
  return t.customer ? { kind: 'initials', text: t.customer.initials } : { kind: 'gone' };
}

export const isActive = (t: ThreadView): boolean => t.status === 'Open' || t.status === 'Replied';

/** The other party left Sweet Hand, so nothing more can reach them (L2-072.2). */
export const otherPartyGone = (t: ThreadView): boolean => t.viewer === 'caterer' && !t.customer;

export const canReply = (t: ThreadView): boolean => isActive(t) && !otherPartyGone(t);

/** Actions offered in the thread head (decline-or-close-enquiry and share-contact-details designs, mocks). */
export function actionsFor(t: ThreadView): { share: boolean; shared: boolean; close: boolean; decline: boolean } {
  if (!canReply(t)) return { share: false, shared: false, close: false, decline: false };
  const caterer = t.viewer === 'caterer';
  return {
    share: !t.sharedByMe,
    shared: t.sharedByMe,
    // Caterers decline while Open and close once they have replied; customers close either way.
    decline: caterer && t.status === 'Open',
    close: !caterer || t.status === 'Replied',
  };
}

/** "Sent yesterday at 4:15 p.m.", "Sent Thu 8 Oct at 8:03 p.m."; just the day for a former user. */
export function sentLine(t: ThreadView, now: Date = new Date()): string {
  const day = torontoToday(new Date(t.sentAt));
  const today = torontoToday(now);
  const yesterday = torontoToday(new Date(now.getTime() - 86_400_000));
  const at = time(t.sentAt);
  if (!t.customer) return $localize`:@@thread.sentOn:Sent ${shortDate(t.sentAt, now)}:date:`;
  if (day === today) return $localize`:@@thread.sentToday:Sent today at ${at}:time:`;
  if (day === yesterday) return $localize`:@@thread.sentYesterday:Sent yesterday at ${at}:time:`;
  return $localize`:@@thread.sentOnAt:Sent ${shortDate(t.sentAt, now)}:date: at ${at}:time:`;
}

export function summaryRows(t: ThreadView): { term: string; value: string }[] {
  return [
    { term: $localize`:@@thread.eventDate:Event date`, value: longDate(t.eventDate) },
    { term: $localize`:@@thread.guests:Guests`, value: count(t.guests) },
    { term: $localize`:@@thread.area:Area`, value: t.viewer === 'caterer' && t.fsa ? `${t.area} · ${t.fsa}` : t.area },
    { term: $localize`:@@thread.occasion:Occasion`, value: t.occasion },
  ];
}

/** The fit warnings the customer saw before sending, worded for the caterer (L2-024.3). */
export function fitWarningText(w: FitWarning): string {
  return w.kind === 'area'
    ? $localize`:@@thread.fitArea:You don’t list ${w.area}:area: as an area you serve`
    : $localize`:@@thread.fitGuests:You usually serve ${count(w.min ?? 0)}:min:–${count(w.max ?? 0)}:max: guests`;
}

function contactCard(t: ThreadView, mine: boolean, c: ContactDetails | null): EntryVm['contact'] {
  if (!c) return null;
  const title = mine ? $localize`:@@thread.yourDetails:Your details, visible to ${otherName(t)}:name: in this enquiry` : c.name;
  return { title, email: c.email, phone: c.phone };
}

/** The entries after the original enquiry, worded for the viewer (message CRD, "Content"). */
export function threadEntries(t: ThreadView, now: Date = new Date()): EntryVm[] {
  const you = $localize`:@@thread.you:You`;
  const caterer = t.viewer === 'caterer';
  const out: EntryVm[] = [];
  const add = (e: Omit<EntryVm, 'time' | 'contact'> & { contact?: EntryVm['contact'] }, at: string) =>
    out.push({ contact: null, ...e, time: messageTime(at, now), datetime: at });

  // The caterer reads the original enquiry as the customer's first message; the customer sees it in the summary.
  if (caterer) add({ id: `${t.id}-enquiry`, kind: 'theirs', sender: otherName(t), text: t.message, datetime: t.sentAt }, t.sentAt);

  for (const e of t.entries) entry(e);
  return out;

  function nameOf(party: 'customer' | 'caterer'): string {
    return party === 'caterer' ? t.caterer.name : (t.customer?.name ?? FORMER_USER());
  }

  function entry(e: ThreadEntryView): void {
    switch (e.kind) {
      case 'reply': {
        const mine = e.from === t.viewer;
        add({ id: e.id, kind: mine ? 'mine' : 'theirs', sender: mine ? you : nameOf(e.from), text: e.text, datetime: e.at }, e.at);
        return;
      }
      case 'declined':
        if (caterer) {
          const text = e.note
            ? $localize`:@@thread.declinedNote:${t.caterer.name}:name: declined this enquiry: “${e.note}:note:”`
            : $localize`:@@thread.declined:${t.caterer.name}:name: declined this enquiry`;
          add({ id: e.id, kind: 'system', sender: null, text, datetime: e.at }, e.at);
        } else {
          add({ id: e.id, kind: 'system', sender: null, text: $localize`:@@thread.cantTakeOn:${t.caterer.name}:name: can’t take on this event`, datetime: e.at }, e.at);
          if (e.note) add({ id: `${e.id}-note`, kind: 'theirs', sender: t.caterer.name, text: e.note, datetime: e.at }, e.at);
        }
        return;
      case 'closed': {
        const text =
          e.by === 'system'
            ? $localize`:@@thread.autoClosed:Closed automatically 30 days after the event.`
            : $localize`:@@thread.closedBy:${nameOf(e.by)}:name: closed this enquiry`;
        add({ id: e.id, kind: 'system', sender: null, text, datetime: e.at }, e.at);
        return;
      }
      case 'shared': {
        const mine = e.by === t.viewer;
        const text = mine
          ? $localize`:@@thread.youShared:You shared your contact details with ${otherName(t)}:name:`
          : $localize`:@@thread.theyShared:${nameOf(e.by)}:name: shared their contact details`;
        add({ id: e.id, kind: 'system', sender: null, text, datetime: e.at, contact: contactCard(t, mine, e.contact) }, e.at);
        return;
      }
    }
  }
}
