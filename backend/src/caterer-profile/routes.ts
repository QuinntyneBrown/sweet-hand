import { roles, type Area } from '../http/router.ts';
import { ownProfile, referenceData } from './profile.ts';
import { saveSection } from './sections.ts';
import { addDish, removeDish, reorderDishes, updateDish } from './menu.ts';
import { PHOTO_BODY_BYTES, removePhoto, reorderPhotos, replacePhoto, restorePhoto, updatePhoto, uploadPhoto } from './photos.ts';

const caterer = roles('Caterer');

/** The signed-in caterer's own profile (docs/detailed-designs/caterer-profiles). Every route reaches only the caller's profile. */
export const catererProfileArea: Area = (r) => {
  r.get('/api/caterer/profile', caterer, ownProfile);
  r.get('/api/caterer/profile/reference-data', caterer, referenceData);
  r.put('/api/caterer/profile/sections/:section', caterer, saveSection);

  // Photos (manage-photos design)
  r.post('/api/caterer/profile/photos', caterer, uploadPhoto, { maxBodyBytes: PHOTO_BODY_BYTES });
  r.post('/api/caterer/profile/photos/:id/replacement', caterer, replacePhoto, { maxBodyBytes: PHOTO_BODY_BYTES });
  r.put('/api/caterer/profile/photos/order', caterer, reorderPhotos);
  r.patch('/api/caterer/profile/photos/:id', caterer, updatePhoto);
  r.delete('/api/caterer/profile/photos/:id', caterer, removePhoto);
  r.post('/api/caterer/profile/photos/:id/restoration', caterer, restorePhoto);

  // Menu (manage-menu design); `order` is registered before `:id`.
  r.post('/api/caterer/profile/menu-items', caterer, addDish);
  r.put('/api/caterer/profile/menu-items/order', caterer, reorderDishes);
  r.put('/api/caterer/profile/menu-items/:id', caterer, updateDish);
  r.delete('/api/caterer/profile/menu-items/:id', caterer, removeDish);
};
