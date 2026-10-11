import { randomUUID } from 'node:crypto';
import type { EnquiryStatus } from '@contract/enquiry-status.ts';
import type { Party } from '@contract/party.ts';
import { caterers } from '../../caterers/model.ts';
import { findUserByEmail, liveUser, users, type User } from '../../identity/model.ts';
import { setMailServiceStatus } from '../../platform/mail-service.ts';
import { enquiries, type Enquiry, type EnquiryEvent } from '../../enquiries/model.ts';
import { activityBy, appendEvent, enquiriesOf, lastActivityAt, otherSide, partyOf } from '../../enquiries/rules.ts';
import { DAILY_LIMIT } from '../../enquiries/send.ts';
import type { ScenarioContext, Scenarios } from '../scenario.ts';

const HOUR_MS = 3_600_000;

async function user(ctx: ScenarioContext, email: string): Promise<User> {
  const found = await findUserByEmail(ctx.tx, email);
  if (!found) throw new Error(`No account for ${email}`);
  return found;
}

/** One enquiry by customer email (or 'former' for a deleted account) and caterer slug. */
async function find(ctx: ScenarioContext, args: { customer?: string; caterer: string }): Promise<Enquiry> {
  const c = await caterers(ctx.tx).findOne({ slug: args.caterer });
  const customer = args.customer && args.customer !== 'former' ? await user(ctx, args.customer) : undefined;
  const candidates = c ? await enquiries(ctx.tx).find({ catererId: c.id }) : [];
  for (const e of candidates.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (args.customer === 'former' ? !(await liveUser(ctx.tx, e.customerId)) : !customer || e.customerId === customer.id) return e;
  }
  throw new Error(`No enquiry for ${JSON.stringify(args)}`);
}

const FIRST_NAMES = ['Kwame', 'Rhea', 'Leon', 'Tara', 'Grace', 'Omar', 'Chantal', 'Winston', 'Lisa', 'Patrick', 'Ayesha', 'Dwayne'];
const LAST_NAMES = ['Owusu', 'Mahabir', 'Bascombe', 'Singh', 'Alleyne', 'Hosein'];
/** Fictional, unique names for extra customers; the first one is long, to show truncation. */
const customerName = (i: number) =>
  i === 0 ? 'Simone Achterberg-Ramkissoon' : `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`;

const reply = (by: Party, at: string, text: string): EnquiryEvent => ({ id: randomUUID(), kind: 'reply', by, at: new Date(at).toISOString(), text });

/** Named enquiry arrangements the Playwright suite asks for (ADR 0009), matching the fake backend's. */
export const enquiriesScenarios: Scenarios = {
  /** The id of one enquiry, by customer email (or 'former') and caterer slug. */
  'enquiry-id': async (ctx, args: { customer?: string; caterer: string }) => ({ id: (await find(ctx, args)).id }),

  /** Exactly `count` of a user's threads are unread, newest first (L2-029). */
  'set-unread': async (ctx, { email, count }: { email: string; count: number }) => {
    let left = count;
    for (const { e, party } of await enquiriesOf(ctx.tx, await user(ctx, email))) {
      const theirs = activityBy(e, otherSide(party)).sort();
      if (left > 0 && theirs.length) {
        e.readAt = { ...e.readAt, [party]: new Date(Date.parse(theirs.at(-1)!) - 1000).toISOString() };
        left -= 1;
      } else {
        e.readAt = { ...e.readAt, [party]: lastActivityAt(e) };
      }
      await enquiries(ctx.tx).put(e);
    }
  },

  /** The other party writes in a thread, as if from another device. */
  'add-message': async (ctx, args: { customer?: string; caterer: string; from: Party; text: string }) => {
    const e = await find(ctx, args);
    appendEvent(e, ctx.now, randomUUID(), { kind: 'reply', by: args.from, text: args.text });
    if (args.from === 'caterer' && e.status === 'Open') e.status = 'Replied';
    await enquiries(ctx.tx).put(e);
  },

  /** Moves an enquiry to a status as if it happened elsewhere (another tab, the other party, the daily job). */
  'set-status': async (ctx, args: { customer?: string; caterer: string; status: EnquiryStatus }) => {
    const e = await find(ctx, args);
    if (args.status === 'Closed') appendEvent(e, ctx.now, randomUUID(), { kind: 'closed', by: 'customer' });
    if (args.status === 'Declined') appendEvent(e, ctx.now, randomUUID(), { kind: 'declined', by: 'caterer', note: null });
    if (args.status === 'Replied') appendEvent(e, ctx.now, randomUUID(), { kind: 'reply', by: 'caterer', text: 'Thanks for asking! Yes, we can do that.' });
    e.status = args.status;
    await enquiries(ctx.tx).put(e);
  },

  /** One party shares their contact details in a thread, as if from another device. */
  'share-contact': async (ctx, args: { customer?: string; caterer: string; by: Party }) => {
    const e = await find(ctx, args);
    appendEvent(e, ctx.now, randomUUID(), { kind: 'shared', by: args.by });
    await enquiries(ctx.tx).put(e);
  },

  /** A second enquiry between the same customer and caterer (L2-035.3). */
  'another-enquiry': async (ctx, args: { customer: string; caterer: string }) => {
    const first = await find(ctx, args);
    const e: Enquiry = {
      ...first,
      id: randomUUID(),
      eventDate: '2026-12-19',
      guests: 40,
      occasion: 'birthdays',
      message: 'Another one: could you do a small Christmas lunch for 40?',
      createdAt: new Date(ctx.now.getTime() - HOUR_MS).toISOString(),
      status: 'Open',
      events: [],
      readAt: {},
      fitWarnings: undefined,
    };
    await enquiries(ctx.tx).put(e);
    return { id: e.id };
  },

  'set-event-date': async (ctx, args: { customer?: string; caterer: string; date: string }) => {
    const e = await find(ctx, args);
    await enquiries(ctx.tx).put({ ...e, eventDate: args.date });
  },

  /** The mail service is slow: replies still save, and say so (L2-030.1). */
  'emails-running-late': ({ tx }) => setMailServiceStatus(tx, 'slow'),

  /** The email provider is down: sending still works and the email waits in the queue (L2-030.1, L2-091.1). */
  'email-provider-down': ({ tx }) => setMailServiceStatus(tx, 'down'),

  /** A customer who registered but has not verified their email yet (L2-023.2). */
  'unverified-customer': async (ctx, { email }: { email: string }) => {
    await users(ctx.tx).put({ ...(await user(ctx, email)), emailVerified: false });
  },

  /** The customer follows the verification link (verify-email design). */
  'verify-email': async (ctx, { email }: { email: string }) => {
    await users(ctx.tx).put({ ...(await user(ctx, email)), emailVerified: true });
  },

  /** The customer has sent 10 enquiries in the past 24 hours (L2-025.1). */
  'daily-enquiry-limit-reached': async (ctx, { email }: { email: string }) => {
    const u = await user(ctx, email);
    const others = (await caterers(ctx.tx).find({ status: 'Published' })).filter((c) => c.id !== 'cat-001').slice(0, DAILY_LIMIT);
    for (const [i, c] of others.entries()) {
      const at = new Date(ctx.now.getTime() - (i + 1) * HOUR_MS).toISOString();
      await enquiries(ctx.tx).put({
        id: randomUUID(),
        customerId: u.id,
        catererId: c.id,
        eventDate: '2026-12-05',
        guests: 40,
        area: c.areas[0],
        fsa: null,
        occasion: 'birthdays',
        message: 'Could you cater a birthday lunch for 40 people?',
        createdAt: at,
        status: 'Open',
        events: [],
        readAt: { customer: at },
      });
    }
  },

  /** The customer's account was created 20 minutes ago (L2-025.3). */
  'new-account': async (ctx, { email }: { email: string }) => {
    await users(ctx.tx).put({ ...(await user(ctx, email)), createdAt: new Date(ctx.now.getTime() - 20 * 60_000).toISOString() });
  },

  /** The user has never sent or received an enquiry. */
  'no-enquiries': async (ctx, { email }: { email: string }) => {
    const u = await user(ctx, email);
    for (const e of await enquiries(ctx.tx).all()) if (partyOf(u, e)) await enquiries(ctx.tx).delete(e.id);
  },

  /** Older enquiries so the inbox runs to several pages (L2-031.1). */
  'more-enquiries': async (ctx, { email, count, statuses }: { email: string; count: number; statuses: EnquiryStatus[] }) => {
    const u = await user(ctx, email);
    const published = (await caterers(ctx.tx).find({ status: 'Published' })).filter((c) => c.id !== 'cat-001');
    for (let i = 0; i < count; i++) {
      const created = new Date(Date.UTC(2026, 7, 30 - i, 18, 0));
      const status = statuses[i % statuses.length];
      let customerId = u.id;
      let catererId = published[i % published.length].id;
      if (u.role === 'Caterer') {
        catererId = u.catererId!;
        customerId = `user-extra-${i}`;
        const name = customerName(i);
        // A fictional customer who cannot sign in: the password hash matches nothing.
        await users(ctx.tx).put({
          ...u,
          id: customerId,
          role: 'Customer',
          displayName: name,
          email: `extra-${i}@example.com`,
          emailKey: `extra-${i}@example.com`,
          passwordHash: '!',
          catererId: undefined,
          phone: undefined,
        });
      }
      const at = (h: number) => new Date(created.getTime() + h * HOUR_MS).toISOString();
      const events: EnquiryEvent[] = [];
      if (status === 'Declined') events.push({ id: randomUUID(), kind: 'declined', by: 'caterer', at: at(2), note: null });
      else if (status !== 'Open') events.push({ id: randomUUID(), kind: 'reply', by: 'caterer', at: at(2), text: 'Thanks for asking. Here is what we can do.' });
      if (status === 'Closed') events.push({ id: randomUUID(), kind: 'closed', by: 'customer', at: at(30) });
      await enquiries(ctx.tx).put({
        id: randomUUID(),
        customerId,
        catererId,
        eventDate: '2026-09-19',
        guests: 30 + i,
        area: 'scarborough',
        fsa: null,
        occasion: 'birthdays',
        message: 'Could you cater a birthday lunch?',
        createdAt: created.toISOString(),
        status,
        events,
        readAt: { customer: at(40), caterer: at(40) },
      });
    }
  },

  /** A week of back-and-forth with Pelau House (pages/thread/long). */
  'long-thread': async (ctx, args: { customer?: string; caterer: string }) => {
    const e = await find(ctx, args);
    const lines: [Party, string, string][] = [
      ['caterer', '2026-10-09T08:05:00-04:00', 'Hi Marcia, congratulations to your parents! Is the hall kitchen available for warming, or should we bring everything hot?'],
      ['customer', '2026-10-09T08:40:00-04:00', 'There’s a small kitchen with an oven, no stove.'],
      ['caterer', '2026-10-09T09:12:00-04:00', 'Perfect. We’ll bring chafing dishes and serving spoons. Any allergies in the group?'],
      ['customer', '2026-10-09T12:30:00-04:00', 'Two guests can’t have nuts, and my uncle doesn’t eat pork.'],
      ['caterer', '2026-10-09T13:02:00-04:00', 'No nuts or pork in any of those four dishes. I’ll leave the black cake off.'],
      ['customer', '2026-10-09T18:48:00-04:00', 'Could we add doubles as a starter?'],
      ['caterer', '2026-10-09T19:20:00-04:00', 'Yes, doubles are $3 each with a 40 minimum. For 120 that’s $360.'],
      ['customer', '2026-10-09T21:05:00-04:00', 'Let’s do it. What would the total be?'],
      ['caterer', '2026-10-10T09:42:00-04:00', 'For 120, the four dishes plus doubles come to about $2,960 before tax. Shall I hold the date?'],
      ['customer', '2026-10-10T09:50:00-04:00', 'Yes please! I’ll confirm the final count by 7 November.'],
    ];
    await enquiries(ctx.tx).put({ ...e, events: lines.map(([by, at, text]) => reply(by, at, text)) });
  },

  /** Markup and a link in messages, shown as plain text (pages/thread/edge, L2-032.3–4, L2-080.1). */
  'edge-thread': async (ctx, args: { customer?: string; caterer: string }) => {
    const e = await find(ctx, args);
    await enquiries(ctx.tx).put({
      ...e,
      message:
        'Could you do the menu from your photos? <script>alert(1)</script> Sorry, my phone pasted something odd.\n\nAlso: callaloo-macaroni-pie-curry-goat-pelau-doubles-aloo-pie-for-everyone-please!',
      events: [
        reply(
          'caterer',
          '2026-10-10T09:42:00-04:00',
          'Our full menu is at https://pelauhouse.example/menu-2026 — copy it into your browser. <img src=x onerror=alert(1)> was in your message too; it shows as plain text here.',
        ),
        reply('customer', '2026-10-10T09:50:00-04:00', '👍🏾 Thank you! Ou se yon bon kizinyè. ¡Gracias!'),
      ],
    });
  },
};
