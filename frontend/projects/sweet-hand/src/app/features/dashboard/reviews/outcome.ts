import type { OwnReviewView } from '@sweet-hand/api';

export type Outcome = { kind: 'saved'; review: OwnReviewView } | { kind: 'deleted'; review: OwnReviewView; text: string };
