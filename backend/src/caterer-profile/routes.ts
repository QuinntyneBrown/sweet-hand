import { roles, type Area } from '../http/router.ts';
import { ownProfile, referenceData } from './profile.ts';
import { saveSection } from './sections.ts';

const caterer = roles('Caterer');

/** The signed-in caterer's own profile (docs/detailed-designs/caterer-profiles). Every route reaches only the caller's profile. */
export const catererProfileArea: Area = (r) => {
  r.get('/api/caterer/profile', caterer, ownProfile);
  r.get('/api/caterer/profile/reference-data', caterer, referenceData);
  r.put('/api/caterer/profile/sections/:section', caterer, saveSection);
};
