import { monthYear } from '../../../core/format/format';

/** Words for reviews (docs/detailed-designs/reviews/show-reviews), from the resource files. */

/** "23 reviews", "1 review" */
export function reviewCount(n: number): string {
  return n === 1 ? $localize`:@@reviews.countOne:1 review` : $localize`:@@reviews.count:${n}:count: reviews`;
}

/** "Event in August 2026" from "2026-08" (America/Toronto). */
export function eventLabel(eventMonth: string): string {
  return $localize`:@@reviews.event:Event in ${monthYear(`${eventMonth}-15`)}:month:`;
}

/** "5 out of 5" */
export function ratingLabel(rating: number): string {
  return $localize`:@@reviews.outOf5:${rating}:rating: out of 5`;
}

/** "Response from Pelau House" (L2-052.1) */
export function responseLabel(catererName: string): string {
  return $localize`:@@reviews.responseFrom:Response from ${catererName}:name:`;
}

/** "20 of 23 reviews shown" after loading more (L2-067.5). */
export function reviewsShown(shown: number, total: number): string {
  return $localize`:@@reviews.shown:${shown}:shown: of ${total}:total: reviews shown`;
}
