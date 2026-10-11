/** Sending an enquiry and the limits that protect caterers (send-enquiry and limit-enquiry-abuse designs). */
import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/router.ts';
import { invalid, notFound, ok, problem } from '../http/problems.ts';
import { validChallenge } from '../platform/bot-challenge.ts';
import { mailServiceStatus } from '../platform/mail-service.ts';
import { recordSecurityEvent } from '../platform/security-log.ts';
import type { Transaction } from '../platform/database.ts';
import type { EnquiryFormValues } from '@contract/enquiry-form-values.ts';
import type { EnquiryRefusal } from '@contract/enquiry-refusal.ts';
import type { SendEnquiryRequest } from '@contract/send-enquiry-request.ts';
import type { SentEnquiryView } from '@contract/sent-enquiry-view.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import type { User } from '../identity/model.ts';
import { currentUser } from '../identity/sessions.ts';
import { ALL_AREAS, OCCASIONS, areaName, occasionName } from '../discovery/taxonomy.ts';
import { torontoDate } from '../discovery/listing.ts';
import { enquiries, type Enquiry } from './model.ts';
import { isActive } from './rules.ts';
import { catererOwner, firstName, fitWarnings, partiesOf } from './views.ts';
import { notifyNewEnquiry } from './notifications.ts';
import { forgetDraft } from './drafts.ts';
import { length, text } from './thread.ts';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
export const DAILY_LIMIT = 10;
export const NEW_ACCOUNT_LIMIT = 3;

/** A Canadian postal code, or just its forward sortation area. */
const POSTAL = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z](?:[ -]?\d[ABCEGHJ-NPRSTV-Z]\d)?$/i;

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** What the form holds, field by field; anything else in the body is ignored. */
export function formValues(body: Record<string, unknown> | undefined): EnquiryFormValues {
  const b = body ?? {};
  return {
    eventDate: text(b['eventDate']),
    guests: b['guests'] === undefined || b['guests'] === null ? '' : String(b['guests']),
    area: text(b['area']),
    postalCode: text(b['postalCode']),
    occasion: text(b['occasion']),
    message: text(b['message']),
  };
}

/** The field rules of L2-022, one message per failing field, keyed by request field. */
export function enquiryErrors(values: EnquiryFormValues, now: Date): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const today = torontoDate(now);
  const date = values.eventDate;
  const realDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
  if (!realDate) errors['eventDate'] = ['Choose a date for your event'];
  else if (date < addDays(today, 2)) errors['eventDate'] = ['Choose a date at least 2 days from today'];
  else if (date > addMonths(today, 24)) errors['eventDate'] = ['Choose a date within the next 24 months'];
  const guests = values.guests.trim();
  if (!/^\d+$/.test(guests) || Number(guests) < 1 || Number(guests) > 5000) errors['guests'] = ['Enter a whole number of guests from 1 to 5,000'];
  if (!ALL_AREAS.some((a) => a.id === values.area)) errors['area'] = ['Choose an area'];
  const postal = values.postalCode.trim();
  if (postal && !POSTAL.test(postal)) errors['postalCode'] = ['Enter a valid postal code, like M1E 4R8'];
  if (!OCCASIONS.some((o) => o.id === values.occasion)) errors['occasion'] = ['Choose an occasion'];
  const message = values.message.trim();
  if (length(message) < 20) errors['message'] = ['Tell the caterer a little more (at least 20 characters)'];
  else if (length(message) > 2000) errors['message'] = ['Keep your message under 2,000 characters'];
  return errors;
}

function refuse(status: number, code: EnquiryRefusal, title: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>): Reply {
  return { ...problem(status, title, { code, ...extra }), headers };
}

const retryAfter = (untilMs: number, now: Date) => ({ 'retry-after': String(Math.ceil((untilMs - now.getTime()) / 1000)) });

/** New-account, daily and duplicate limits, in that order (limit-enquiry-abuse design, `EnquiryLimitPolicy`). */
async function limitRefusal(tx: Transaction, user: User, caterer: Caterer, eventDate: string, now: Date): Promise<Reply | null> {
  const mine = await enquiries(tx).find({ customerId: user.id });
  const sentSince = (since: number) => mine.filter((e) => Date.parse(e.createdAt) >= since);
  const created = Date.parse(user.createdAt);
  if (now.getTime() - created < HOUR_MS && sentSince(created).length >= NEW_ACCOUNT_LIMIT) {
    return refuse(429, 'new-account-limit', 'New accounts can send 3 enquiries in their first hour', {}, retryAfter(created + HOUR_MS, now));
  }
  // A day-old enquiry has left the window, so the retry-after time is exact.
  const lastDay = mine.filter((e) => Date.parse(e.createdAt) > now.getTime() - DAY_MS);
  if (lastDay.length >= DAILY_LIMIT) {
    const oldest = Math.min(...lastDay.map((e) => Date.parse(e.createdAt)));
    return refuse(429, 'daily-limit', 'You’ve reached today’s enquiry limit. Try again tomorrow.', {}, retryAfter(oldest + DAY_MS, now));
  }
  const existing = mine.find((e) => e.catererId === caterer.id && e.eventDate === eventDate && isActive(e));
  if (existing) return refuse(409, 'duplicate', 'You already have an open enquiry with this caterer for that date', { enquiryId: existing.id });
  return null;
}

/** The signed-in customer, or the refusal for any other role (L2-023.4). */
export function customerOnly(req: Request): User | Reply {
  const user = currentUser(req);
  if (user.role !== 'Customer') return refuse(403, 'customer-only', 'Sign in with a customer account to send enquiries');
  return user;
}

export const isReply = (x: User | Reply): x is Reply => typeof (x as Reply).status === 'number';

export const publishedCaterer = (tx: Transaction, slug: unknown) =>
  typeof slug === 'string' ? caterers(tx).findOne({ slug, status: 'Published' }) : Promise.resolve(undefined);

/** POST /api/enquiries: creates an Open enquiry (L2-022, L2-023, L2-024, L2-025, L2-027). */
export async function sendEnquiry(req: Request): Promise<Reply> {
  const user = customerOnly(req);
  if (isReply(user)) return user;
  if (!user.emailVerified) return refuse(403, 'email-unverified', 'Verify your email to send enquiries');
  const body = (req.body ?? {}) as Partial<SendEnquiryRequest>;
  if (!validChallenge(body.challengeToken, 'enquiry')) return refuse(400, 'challenge-failed', 'The bot check failed');
  const caterer = await publishedCaterer(req.tx, body.catererSlug);
  if (!caterer) return notFound();
  const values = formValues(req.body);
  const errors = enquiryErrors(values, req.now);
  if (Object.keys(errors).length) return invalid(errors);
  const limit = await limitRefusal(req.tx, user, caterer, values.eventDate, req.now);
  if (limit) {
    if (limit.status === 429) await recordSecurityEvent(req, 'rate-limit-block', { userId: user.id });
    return limit;
  }

  const now = req.now.toISOString();
  const postal = values.postalCode.trim().toUpperCase();
  const e: Enquiry = {
    // Random, never sequential (L2-034.2).
    id: randomUUID(),
    customerId: user.id,
    catererId: caterer.id,
    eventDate: values.eventDate,
    guests: Number(values.guests.trim()),
    area: values.area,
    // Only the forward sortation area is kept (L2-022).
    fsa: postal ? postal.slice(0, 3) : null,
    occasion: values.occasion,
    message: values.message.trim(),
    createdAt: now,
    status: 'Open',
    events: [],
    readAt: { customer: now },
  };
  // Worked out now, so the caterer sees what the customer saw (L2-024.3).
  e.fitWarnings = fitWarnings(caterer, e);
  await enquiries(req.tx).put(e);
  await forgetDraft(req.tx, user, caterer);
  await notifyNewEnquiry(req.tx, req.now, e, await partiesOf(req.tx, e));
  const owner = await catererOwner(req.tx, caterer);
  const view: SentEnquiryView = {
    id: e.id,
    caterer: { name: caterer.name, slug: caterer.slug },
    contactName: owner ? firstName(owner.displayName) : caterer.name,
    eventDate: e.eventDate,
    guests: e.guests,
    area: areaName(e.area),
    occasion: occasionName(e.occasion),
    emailQueued: (await mailServiceStatus(req.tx)) === 'down',
  };
  return ok(view, 201);
}
