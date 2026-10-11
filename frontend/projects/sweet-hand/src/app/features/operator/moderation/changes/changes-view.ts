import type { DietaryTag } from '@sweet-hand/components';
import { count, shortDate } from '../../../../core/format/format';
import { DIETARY_LABELS } from '../../../discovery/caterer/dietary-labels';
import { guestRange } from '../../../discovery/caterer/caterer-view';
import { relativeDayTime } from '../moderation-text';
import { type ChangeValue, type ChangedField, type RecentChangeView, type RecentChangesPageView } from '@sweet-hand/api';

export function fieldLabel(field: ChangedField): string {
  switch (field) {
    case 'description':
      return $localize`:@@edit.description:Description`;
    case 'guests':
      return $localize`:@@changes.guests:Guests`;
    case 'menu':
      return $localize`:@@caterer.menu:Menu`;
    case 'cover-photo':
      return $localize`:@@changes.coverPhoto:Cover photo`;
    case 'areas':
      return $localize`:@@record.areas:Areas`;
    case 'occasions':
      return $localize`:@@caterer.occasions:Occasions`;
  }
}

/** A value as words: "Serves 30–150 guests", "Escovitch fish · From $19 per person · Gluten-free". */
export function valueText(v: ChangeValue | null): string {
  if (!v) return $localize`:@@changes.nothing:Nothing`;
  switch (v.kind) {
    case 'text':
      return v.text;
    case 'guests':
      return guestRange(v.min, v.max);
    case 'list':
      return v.items.join(', ');
    case 'dish':
      return [v.name, v.price, ...v.tags.map((t) => DIETARY_LABELS[t as DietaryTag] ?? t)].filter(Boolean).join(' · ');
    case 'photo':
      return v.alt;
  }
}

export interface ChangeEntry {
  id: string;
  heading: string;
  byline: string;
  photo: string | null;
  isPhoto: boolean;
  old: ChangeValue | null;
  new: ChangeValue | null;
  oldText: string;
  newText: string;
  revertObject: string;
  reverted: string | null;
  view: RecentChangeView;
}

export function changeEntry(c: RecentChangeView, now: Date = new Date()): ChangeEntry {
  const label = fieldLabel(c.field);
  return {
    id: c.id,
    heading: `${c.catererName} · ${label}`,
    byline: `${c.by} · ${relativeDayTime(c.at, now)}`,
    photo: c.photo,
    isPhoto: c.field === 'cover-photo',
    old: c.old,
    new: c.new,
    oldText: valueText(c.old),
    newText: valueText(c.new),
    revertObject: ` ${c.catererName} ${label.toLocaleLowerCase('en-CA')}`,
    reverted: c.reverted ? $localize`:@@changes.reverted:Reverted by ${c.reverted.by}:name: · ${shortDate(c.reverted.at, now)}:date:` : null,
    view: c,
  };
}

/** "24 changes · last 30 days · newest first" */
export function changesSubtitle(view: RecentChangesPageView): string {
  if (!view.total) return $localize`:@@changes.lastThirty:Last 30 days`;
  return view.total === 1
    ? $localize`:@@changes.one:1 change · last 30 days · newest first`
    : $localize`:@@changes.many:${count(view.total)}:count: changes · last 30 days · newest first`;
}

export function revertTitle(c: RecentChangeView): string {
  return $localize`:@@revert.title:Revert ${c.catererName}:name:’s ${fieldLabel(c.field).toLocaleLowerCase('en-CA')}:field:?`;
}

export function revertDescription(c: RecentChangeView, owner: string): string {
  return c.old?.kind === 'text'
    ? $localize`:@@revert.descriptionText:The public page goes back to the earlier text within a minute. ${owner}:owner: is emailed your reason.`
    : $localize`:@@revert.descriptionValue:The public page goes back to the earlier value within a minute. ${owner}:owner: is emailed your reason.`;
}
