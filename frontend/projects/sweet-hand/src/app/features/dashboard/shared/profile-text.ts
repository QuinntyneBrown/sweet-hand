import type { CheckStatusLabels, SectionLinkItem, SideNavItem, StatusTone } from '@sweet-hand/components';
import { shortDate } from '../../../core/format/format';
import { type ChecklistKey, type OwnProfileStatus, type OwnProfileView, type ReferenceDataView } from '@sweet-hand/api';
import type { CardModel } from './card-model';
import { paths } from '../../../core/routing/paths';

/**
 * Words and view models of the caterer dashboard (set-up-profile,
 * submit-profile-for-review and edit-published-profile designs): business
 * rules live here, not in templates or library components.
 */

export type NavKey = 'overview' | 'details' | 'cuisines' | 'events' | 'photos' | 'menu' | 'food-safety' | 'reviews';

export const SECTION_HREF: Record<Exclude<NavKey, 'overview'>, string> = {
  details: paths.dashboard.details,
  cuisines: paths.dashboard.cuisines,
  events: paths.dashboard.events,
  photos: paths.dashboard.photos,
  menu: paths.dashboard.menu,
  'food-safety': paths.dashboard.foodSafety,
  reviews: paths.dashboard.reviews,
};

/** The dashboard's side navigation; a removed caterer keeps only the overview, enquiry history and account (L2-058.5). */
export function dashboardNav(current: NavKey, status: OwnProfileStatus | null, unread: number): SideNavItem[][] {
  const overview: SideNavItem = { label: $localize`:@@nav.overview:Overview`, href: paths.dashboard.overview, current: current === 'overview' };
  const account: SideNavItem = { label: $localize`:@@nav.account:Account`, href: paths.account };
  if (status === 'Removed') {
    return [[overview], [{ label: $localize`:@@nav.enquiryHistory:Enquiry history`, href: paths.dashboard.enquiries }, account]];
  }
  const item = (key: Exclude<NavKey, 'overview'>, label: string): SideNavItem => ({ label, href: SECTION_HREF[key], current: current === key });
  return [
    [
      overview,
      item('details', $localize`:@@nav.businessDetails:Business details`),
      item('cuisines', $localize`:@@nav.cuisinesAreas:Cuisines and areas`),
      item('events', $localize`:@@nav.guestsOccasions:Guests and occasions`),
      item('photos', $localize`:@@nav.photos:Photos`),
      item('menu', $localize`:@@nav.menu:Menu`),
      item('food-safety', $localize`:@@nav.foodSafety:Food safety`),
    ],
    [
      { label: $localize`:@@nav.enquiries:Enquiries`, href: paths.dashboard.enquiries, count: unread ? $localize`:@@nav.unread:${unread}:count: unread` : undefined },
      item('reviews', $localize`:@@nav.reviews:Reviews`),
      account,
    ],
  ];
}

export function statusTone(status: OwnProfileStatus): StatusTone {
  const tones: Record<OwnProfileStatus, StatusTone> = {
    Draft: 'draft',
    'Pending review': 'pending',
    'Changes requested': 'changes',
    Published: 'published',
    Suspended: 'suspended',
    Removed: 'removed',
  };
  return tones[status];
}

export function statusLabel(status: OwnProfileStatus): string {
  switch (status) {
    case 'Draft':
      return $localize`:@@profileStatus.draft:Draft`;
    case 'Pending review':
      return $localize`:@@profileStatus.pending:Pending review`;
    case 'Changes requested':
      return $localize`:@@profileStatus.changes:Changes requested`;
    case 'Published':
      return $localize`:@@profileStatus.published:Published`;
    case 'Suspended':
      return $localize`:@@profileStatus.suspended:Suspended`;
    case 'Removed':
      return $localize`:@@profileStatus.removed:Removed`;
  }
}

export const CHECK_LABELS = (): CheckStatusLabels => ({
  missing: $localize`:@@checklist.toDo:To do: `,
  done: $localize`:@@checklist.done:Done: `,
  attention: $localize`:@@checklist.attention:Needs attention: `,
});

/** "14 Mar 2029": a day without the weekday, for expiry dates. */
export function dayMonthYear(value: string): string {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00-05:00` : value);
  const p: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', day: 'numeric', month: 'short', year: 'numeric' }).formatToParts(d)) p[part.type] = part.value;
  return `${p['day']} ${p['month'].replace('.', '')} ${p['year']}`;
}

/** "Tue 2 Sep" this year, "14 Jan 2022" before. */
export function savedOn(value: string, now: Date = new Date()): string {
  const year = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric' }).format(d);
  return year(new Date(value)) === year(now) ? shortDate(value, now) : dayMonthYear(value);
}

export function cuisineName(ref: ReferenceDataView, id: string | null): string {
  return ref.cuisines.find((c) => c.id === id)?.name ?? '';
}

export function areaName(ref: ReferenceDataView, id: string | null): string {
  for (const region of ref.regions) {
    const area = region.areas.find((a) => a.id === id);
    if (area) return area.name;
  }
  return '';
}

export function cardModel(profile: OwnProfileView, ref: ReferenceDataView): CardModel {
  return {
    name: profile.name,
    cuisine: cuisineName(ref, profile.primaryCuisine) || $localize`:@@preview.noCuisine:Your cuisine`,
    area: areaName(ref, profile.primaryArea) || $localize`:@@preview.noArea:Your area`,
    photo: profile.cover ? { ...profile.cover.image, alt: profile.cover.alt } : null,
  };
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export const photosCount = (n: number) => (n === 1 ? $localize`:@@count.photo:1 photo` : $localize`:@@count.photos:${n}:count: photos`);
export const dishesCount = (n: number) => (n === 1 ? $localize`:@@count.dish:1 dish` : $localize`:@@count.dishes:${n}:count: dishes`);
export const cuisinesCount = (n: number) => (n === 1 ? $localize`:@@count.cuisine:1 cuisine` : $localize`:@@count.cuisines:${n}:count: cuisines`);
export const areasCount = (n: number) => (n === 1 ? $localize`:@@count.area:1 area` : $localize`:@@count.areas:${n}:count: areas`);
export const occasionsCount = (n: number) => (n === 1 ? $localize`:@@count.occasion:1 occasion` : $localize`:@@count.occasions:${n}:count: occasions`);

/** "Serves 20–300 guests", "Serves 50 guests" (L2-020.1, L2-020.2). */
export function guestRange(min: number, max: number): string {
  return min === max ? $localize`:@@guests.serves:Serves ${min}:count: guests` : $localize`:@@guests.servesRange:Serves ${min}:min:–${max}:max: guests`;
}

/** "20–300 guests" */
export function guestSpan(min: number, max: number): string {
  return min === max ? $localize`:@@guests.span:${min}:count: guests` : $localize`:@@guests.spanRange:${min}:min:–${max}:max: guests`;
}

const done = (p: OwnProfileView, key: ChecklistKey) => !!p.checklist.find((i) => i.key === key)?.done;

/** Rows of "Your profile" for a published profile (docs/mocks/pages/dashboard/default). */
export function publishedSections(p: OwnProfileView, reviews: { total: number; unanswered: number } | null): SectionLinkItem[] {
  const state = (...keys: ChecklistKey[]) => (keys.every((k) => done(p, k)) ? 'done' : 'attention');
  const cert = p.certificate;
  const rows: SectionLinkItem[] = [
    { title: $localize`:@@nav.businessDetails:Business details`, href: SECTION_HREF.details, meta: $localize`:@@section.detailsMeta:Name and description`, status: state('name', 'description') },
    { title: $localize`:@@nav.cuisinesAreas:Cuisines and areas`, href: SECTION_HREF.cuisines, meta: `${cuisinesCount(p.cuisines.length)} · ${areasCount(p.areas.length)}`, status: state('cuisines', 'areas') },
    {
      title: $localize`:@@nav.guestsOccasions:Guests and occasions`,
      href: SECTION_HREF.events,
      meta: p.minGuests && p.maxGuests ? `${guestSpan(p.minGuests, p.maxGuests)} · ${occasionsCount(p.occasions.length)}` : occasionsCount(p.occasions.length),
      status: state('guests', 'occasions'),
    },
    { title: $localize`:@@nav.photos:Photos`, href: SECTION_HREF.photos, meta: photosCount(p.photos.length), status: state('photos') },
    { title: $localize`:@@nav.menu:Menu`, href: SECTION_HREF.menu, meta: dishesCount(p.dishes.length), status: state('menu') },
    {
      title: $localize`:@@nav.foodSafety:Food safety`,
      href: SECTION_HREF['food-safety'],
      meta: cert
        ? done(p, 'certificate')
          ? $localize`:@@section.certificateValid:Certificate valid until ${dayMonthYear(cert.expires)}:date:`
          : $localize`:@@section.certificateExpired:Certificate expired ${dayMonthYear(cert.expires)}:date:`
        : $localize`:@@checklist.certificateAdd:Add your certificate`,
      status: state('certificate'),
    },
  ];
  if (reviews) {
    const count = reviews.total === 1 ? $localize`:@@count.review:1 review` : $localize`:@@count.reviews:${reviews.total}:count: reviews`;
    const meta = reviews.unanswered ? `${count} · ${$localize`:@@section.unanswered:${reviews.unanswered}:count: without a response`}` : count;
    rows.push({ title: $localize`:@@nav.reviews:Reviews`, href: SECTION_HREF.reviews, meta, status: null });
  }
  return rows;
}

/** Where each submission rule is fixed. */
export const RULE_HREF: Record<ChecklistKey, string> = {
  email: paths.account,
  name: SECTION_HREF.details,
  description: SECTION_HREF.details,
  cuisines: SECTION_HREF.cuisines,
  areas: SECTION_HREF.cuisines,
  guests: SECTION_HREF.events,
  occasions: SECTION_HREF.events,
  photos: SECTION_HREF.photos,
  menu: SECTION_HREF.menu,
  certificate: SECTION_HREF['food-safety'],
};

export function ruleTitle(key: ChecklistKey): string {
  switch (key) {
    case 'email':
      return $localize`:@@checklist.email:Email verified`;
    case 'name':
      return $localize`:@@checklist.name:Business name`;
    case 'description':
      return $localize`:@@checklist.description:Description`;
    case 'cuisines':
      return $localize`:@@checklist.cuisines:Cuisines`;
    case 'areas':
      return $localize`:@@checklist.areas:Areas you serve`;
    case 'guests':
      return $localize`:@@checklist.guests:Guest range`;
    case 'occasions':
      return $localize`:@@checklist.occasions:Occasions`;
    case 'photos':
      return $localize`:@@nav.photos:Photos`;
    case 'menu':
      return $localize`:@@nav.menu:Menu`;
    case 'certificate':
      return $localize`:@@checklist.certificate:Food handler certificate`;
  }
}

/** The words for a section still to do in "2 sections left: photos and food safety". */
export function ruleNoun(key: ChecklistKey): string {
  switch (key) {
    case 'email':
      return $localize`:@@checklist.nounEmail:email`;
    case 'name':
    case 'description':
      return $localize`:@@checklist.nounDetails:business details`;
    case 'cuisines':
    case 'areas':
      return $localize`:@@checklist.nounCuisines:cuisines and areas`;
    case 'guests':
    case 'occasions':
      return $localize`:@@checklist.nounEvents:guests and occasions`;
    case 'photos':
      return $localize`:@@checklist.nounPhotos:photos`;
    case 'menu':
      return $localize`:@@checklist.nounMenu:menu`;
    case 'certificate':
      return $localize`:@@checklist.nounCertificate:food safety`;
  }
}

/** "photos and food safety", "menu, photos and food safety". */
export function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return $localize`:@@list.and:${words.slice(0, -1).join(', ')}:items: and ${words[words.length - 1]}:last:`;
}

/** The setup checklist rows with what is done, still to do, or flagged (L2-038.3, L2-039.2, L2-048.3). */
export function checklistRows(p: OwnProfileView, ref: ReferenceDataView, flagged: ReadonlySet<ChecklistKey> = new Set()): SectionLinkItem[] {
  const firstRun = !p.description && !p.cuisines.length && !p.photos.length && !p.dishes.length && !p.certificate;
  return p.checklist.map(({ key, done: ok }) => {
    const attention = p.attention.find((a) => a.key === key);
    const flag = flagged.has(key) || (key === 'certificate' && !!p.certificate && !ok);
    const status = attention || flag ? 'attention' : ok ? 'done' : 'missing';
    const meta = attention?.note ?? (ok ? doneMeta(key, p, ref) : todoMeta(key, p, firstRun));
    return { title: ruleTitle(key), href: RULE_HREF[key], meta, status };
  });
}

function doneMeta(key: ChecklistKey, p: OwnProfileView, ref: ReferenceDataView): string {
  switch (key) {
    case 'email':
      return p.email;
    case 'name':
      return p.name;
    case 'description':
      return $localize`:@@checklist.characters:${p.description.length}:count: characters`;
    case 'cuisines':
      return p.cuisines.map((id) => cuisineName(ref, id)).join(', ');
    case 'areas': {
      const primary = areaName(ref, p.primaryArea);
      const more = p.areas.length - 1;
      return more ? $localize`:@@checklist.areasMore:${primary}:area: and ${more}:count: more` : primary;
    }
    case 'guests':
      return guestSpan(p.minGuests ?? 0, p.maxGuests ?? 0);
    case 'occasions':
      return occasionsCount(p.occasions.length);
    case 'photos':
      return photosCount(p.photos.length);
    case 'menu':
      return dishesCount(p.dishes.length);
    case 'certificate':
      return $localize`:@@checklist.validUntil:Valid until ${dayMonthYear(p.certificate!.expires)}:date:`;
  }
}

function todoMeta(key: ChecklistKey, p: OwnProfileView, firstRun: boolean): string {
  switch (key) {
    case 'email':
      return $localize`:@@checklist.emailTodo:Check your inbox for our link. Resend it from Account`;
    case 'name':
      return $localize`:@@checklist.nameTodo:2 to 80 characters`;
    case 'description':
      return $localize`:@@checklist.descriptionTodo:50 to 2,000 characters`;
    case 'cuisines':
      return $localize`:@@checklist.cuisinesTodo:1 to 5, with one primary`;
    case 'areas':
      return $localize`:@@checklist.areasTodo:At least 1, with one primary`;
    case 'guests':
      return $localize`:@@checklist.guestsTodo:Smallest and largest event you take on`;
    case 'occasions':
      return $localize`:@@checklist.occasionsTodo:At least 1`;
    case 'photos':
      if (firstRun || !p.photos.length) return $localize`:@@checklist.photosTodo:3 to 30, each with a caption and a cover`;
      return p.photos.length < 3
        ? $localize`:@@checklist.photosMore:Add at least 3 photos · ${p.photos.length}:count: so far`
        : $localize`:@@checklist.photosCaptions:Give every photo a caption`;
    case 'menu':
      if (firstRun || !p.dishes.length) return $localize`:@@checklist.menuTodo:3 to 50 dishes`;
      return $localize`:@@checklist.menuMore:Add at least 3 dishes · ${p.dishes.length}:count: so far`;
    case 'certificate':
      if (p.certificate) return $localize`:@@checklist.certificateExpired:Expired ${dayMonthYear(p.certificate.expires)}:date:`;
      return firstRun ? $localize`:@@checklist.certificateTodo:Holder, issuer, number and expiry` : $localize`:@@checklist.certificateAdd:Add your certificate`;
  }
}

/** Sections still to do, in words: "2 sections left: photos and food safety". */
export function sectionsLeft(p: OwnProfileView): string | null {
  const words = [...new Set(p.checklist.filter((i) => !i.done).map((i) => ruleNoun(i.key)))];
  if (!words.length) return null;
  return words.length === 1
    ? $localize`:@@checklist.oneLeft:1 section left: ${words[0]}:section:`
    : $localize`:@@checklist.manyLeft:${words.length}:count: sections left: ${joinWords(words)}:sections:`;
}

/** "Go to photos": the way to the first section an operator flagged. */
export function attentionAction(key: ChecklistKey): string {
  switch (key) {
    case 'photos':
      return $localize`:@@dashboard.goPhotos:Go to photos`;
    case 'menu':
      return $localize`:@@dashboard.goMenu:Go to menu`;
    case 'certificate':
      return $localize`:@@dashboard.goCertificate:Go to food safety`;
    case 'cuisines':
    case 'areas':
      return $localize`:@@dashboard.goCuisines:Go to cuisines and areas`;
    case 'guests':
    case 'occasions':
      return $localize`:@@dashboard.goEvents:Go to guests and occasions`;
    default:
      return $localize`:@@dashboard.goDetails:Go to business details`;
  }
}
