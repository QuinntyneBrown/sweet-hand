import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from '../button/button';
import { Stars } from '../rating/stars';
import type { ReviewStatusTone } from './review-status-tone';

export const REVIEW_LIST = new InjectionToken<true>('REVIEW_LIST');

/**
 * One review (docs/specs/components/review.md): public, the author's own, the
 * caterer's or the operator's view of the same row. Inside a `sh-review-list`
 * the list places its `li` directly in the `ul`. Text is always text.
 */
@Component({
  selector: 'sh-review',
  imports: [NgTemplateOutlet, Stars],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {
  readonly variant = input<'public' | 'own' | 'caterer' | 'operator'>('public');
  readonly author = input('');
  readonly reviewer = input<string | null>(null);
  readonly eventLabel = input('');
  readonly postedLabel = input<string | null>(null);
  readonly editedLabel = input<string | null>(null);
  readonly rating = input(0);
  readonly ratingLabel = input('');
  readonly body = input('');
  readonly highlights = input<readonly { start: number; end: number }[]>([]);
  readonly response = input<{ label: string; body: string } | null>(null);
  readonly ownLabel = input<string | null>(null);
  readonly editWindowLabel = input<string | null>(null);
  readonly awaitingLabel = input<string | null>(null);
  readonly moderation = input<{ tone: ReviewStatusTone; label: string; detail?: string; time: string } | null>(null);
  readonly catererPhoto = input<{ src: string; width: number; height: number } | null>(null);
  readonly skeleton = input<'public' | 'operator' | null>(null);

  /** The `li.review`, placed by the parent list. */
  readonly item = viewChild.required<TemplateRef<unknown>>('item');
  protected readonly inList = inject(REVIEW_LIST, { optional: true }) !== null;
  protected readonly actions = contentChildren(Button);

  /** "Event in July 2026 · Posted Mon 3 Aug", "by Priya R. · Event in September 2026", "… · Edited" (D-3). */
  protected readonly dateLine = computed(() => {
    const parts = [this.variant() === 'operator' ? this.reviewer() : null, this.eventLabel(), this.variant() === 'caterer' ? this.postedLabel() : null, this.editedLabel()];
    return parts.filter(Boolean).join(' · ');
  });

  /** The body split around flagged ranges, which only the operator sees (D-5). */
  protected readonly bodyParts = computed(() => {
    const body = this.body();
    const ranges = this.variant() === 'operator' ? [...this.highlights()].sort((a, b) => a.start - b.start) : [];
    const parts: { text: string; mark: boolean }[] = [];
    let at = 0;
    for (const { start, end } of ranges) {
      if (start > at) parts.push({ text: body.slice(at, start), mark: false });
      parts.push({ text: body.slice(Math.max(start, at), end), mark: true });
      at = Math.max(at, end);
    }
    if (at < body.length) parts.push({ text: body.slice(at), mark: false });
    return parts;
  });
}

