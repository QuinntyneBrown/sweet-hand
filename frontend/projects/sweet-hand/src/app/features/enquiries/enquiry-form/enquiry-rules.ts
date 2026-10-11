/**
 * The enquiry form's rules, mirroring the server (send-enquiry design,
 * `EnquiryFormValidator` and `EnquiryFitAdvisor`; L2-022, L2-024).
 * Messages come from the resource files.
 */
import { graphemeLength } from '@sweet-hand/components';
import type { EnquiryTarget } from '../../../core/enquiry/enquiry-target';
import { type EnquiryFormValues } from '@sweet-hand/api';
import type { FieldErrors } from './field-errors';

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;
export const GUESTS_MAX = 5000;

/** Control ids in form order; the error summary lists errors in this order (form-layout CRD). */
export const FIELDS = ['date', 'guests', 'area', 'postal', 'occasion', 'message'] as const;
export type Field = (typeof FIELDS)[number];

/** The server's field names (request properties) for each control. */
const SERVER_FIELD: Record<string, Field> = {
  eventDate: 'date',
  guests: 'guests',
  area: 'area',
  postalCode: 'postal',
  occasion: 'occasion',
  message: 'message',
};

export const EMPTY_VALUES: EnquiryFormValues = { eventDate: '', guests: '', area: '', postalCode: '', occasion: '', message: '' };

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

/** The first and last dates the form accepts: 2 days to 24 months from today in Toronto (L2-022). */
export function dateRange(today: string): { min: string; max: string } {
  return { min: addDays(today, 2), max: addMonths(today, 24) };
}

/** A Canadian postal code, or just its forward sortation area. */
const POSTAL = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z](?:[ -]?\d[ABCEGHJ-NPRSTV-Z]\d)?$/i;

/** A whole number of guests from 1 to 5,000, or null. */
export function guestCount(value: string): number | null {
  const v = value.trim();
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n >= 1 && n <= GUESTS_MAX ? n : null;
}

export function enquiryErrors(v: EnquiryFormValues, today: string): FieldErrors {
  const errors: FieldErrors = {};
  const { min, max } = dateRange(today);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)) errors.date = $localize`:@@enquiryForm.dateRequired:Choose a date for your event`;
  else if (v.eventDate < min) errors.date = $localize`:@@enquiryForm.dateTooSoon:Choose a date at least 2 days from today`;
  else if (v.eventDate > max) errors.date = $localize`:@@enquiryForm.dateTooFar:Choose a date within the next 24 months`;
  if (guestCount(v.guests) === null) errors.guests = $localize`:@@enquiryForm.guestsInvalid:Enter a whole number of guests from 1 to 5,000`;
  if (!v.area) errors.area = $localize`:@@enquiryForm.areaRequired:Choose an area`;
  if (v.postalCode.trim() && !POSTAL.test(v.postalCode.trim())) errors.postal = $localize`:@@enquiryForm.postalInvalid:Enter a valid postal code, like M1E 4R8`;
  if (!v.occasion) errors.occasion = $localize`:@@enquiryForm.occasionRequired:Choose an occasion`;
  const length = graphemeLength(v.message.trim());
  if (length < MESSAGE_MIN) errors.message = $localize`:@@enquiryForm.messageShort:Tell the caterer a little more (at least 20 characters)`;
  else if (length > MESSAGE_MAX) errors.message = $localize`:@@enquiryForm.messageLong:Keep your message under 2,000 characters`;
  return errors;
}

/** Server field errors (HTTP 400, L2-022.6) as control errors. */
export function serverErrors(errors: Record<string, string[]>): FieldErrors {
  const out: FieldErrors = {};
  for (const [key, messages] of Object.entries(errors)) {
    const field = SERVER_FIELD[key];
    if (field && messages[0]) out[field] = messages[0];
  }
  return out;
}

/** "This caterer usually serves 20–300 guests" for a valid count outside the range (L2-024.1). */
export function guestsWarning(guests: string, caterer: EnquiryTarget): string | null {
  const n = guestCount(guests);
  if (n === null || (n >= caterer.minGuests && n <= caterer.maxGuests)) return null;
  return $localize`:@@enquiryForm.guestsWarning:This caterer usually serves ${caterer.minGuests}:min:–${caterer.maxGuests}:max: guests`;
}

/** "This caterer doesn’t list Oshawa as an area they serve" (L2-024.2). */
export function areaWarning(areaName: string | null, caterer: EnquiryTarget): string | null {
  if (!areaName || caterer.areas.includes(areaName)) return null;
  return $localize`:@@enquiryForm.areaWarning:This caterer doesn’t list ${areaName}:area: as an area they serve`;
}
