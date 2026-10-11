/** Client checks for a review (L2-050.2): the server applies the same rules. */

export const TEXT_MIN = 20;
export const TEXT_MAX = 2000;

export interface ReviewErrors {
  rating: string | null;
  text: string | null;
}

export function reviewErrors(rating: number | null, length: number): ReviewErrors {
  return {
    rating: rating && Number.isInteger(rating) && rating >= 1 && rating <= 5 ? null : $localize`:@@review.ratingRequired:Choose a rating from 1 to 5 stars`,
    text:
      length < TEXT_MIN
        ? $localize`:@@review.textShort:Write at least 20 characters`
        : length > TEXT_MAX
          ? $localize`:@@review.textLong:Write no more than 2,000 characters`
          : null,
  };
}

export const STAR_LABELS: [string, string, string, string, string] = [
  $localize`:@@review.star1:1 star`,
  $localize`:@@review.star2:2 stars`,
  $localize`:@@review.star3:3 stars`,
  $localize`:@@review.star4:4 stars`,
  $localize`:@@review.star5:5 stars`,
];
