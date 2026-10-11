import type { Document, Transaction } from '../platform/database.ts';
import type { Photo } from '../caterers/model.ts';

/** A photo the caterer removed, kept so "Undo" can put it back in its place (manage-photos design). Keyed by photo id. */
export interface RemovedPhoto extends Document {
  catererId: string;
  photo: Photo;
  index: number;
  removedAt: string;
}

export const removedPhotos = (tx: Transaction) => tx.collection<RemovedPhoto>('removedPhotos');
