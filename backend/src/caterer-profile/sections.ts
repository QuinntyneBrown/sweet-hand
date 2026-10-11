import type { Reply, Request } from '../http/router.ts';
import { badRequest, fail, invalid, notFound } from '../http/problems.ts';
import { allCuisines, ALL_AREAS, OCCASIONS } from '../discovery/taxonomy.ts';
import { assertEditable, loadOwn, saveCaterer, text, type Own } from './own.ts';
import { areasValue, guestsValue, occasionsValue, recordLiveEdit, textValue } from './live-edits.ts';
import { ownProfileReply } from './profile.ts';

const hasErrors = (errors: Record<string, string[]>) => Object.keys(errors).length > 0;

/** Business name and description; a Published profile's new name waits for an operator (L2-038, L2-044.2). */
async function saveDetails(req: Request, own: Own): Promise<void> {
  const c = own.caterer;
  const body = req.body ?? {};
  const errors: Record<string, string[]> = {};
  const name = text(body.name);
  const description = text(body.description);
  if (name.length < 2 || name.length > 80) errors['name'] = ['Enter a business name of 2 to 80 characters'];
  if (description.length > 2000) errors['description'] = ['Write no more than 2,000 characters'];
  else if (c.status === 'Published' && description.length < 50) errors['description'] = ['Write at least 50 characters'];
  if (hasErrors(errors)) fail(invalid(errors));

  await recordLiveEdit(req, own, 'description', textValue(c.description), textValue(description));
  c.description = description;
  if (c.status !== 'Published') {
    c.name = name;
  } else if (name === c.name) {
    // Saving the current name withdraws a pending request.
    delete c.pendingName;
    delete c.pendingNameAt;
  } else if (name !== c.pendingName) {
    // The old name stays live until an operator approves the new one (L2-044.2).
    c.pendingName = name;
    c.pendingNameAt = req.now.toISOString();
  }
}

/** 1–5 cuisines and at least one area, each with a primary that comes first (L2-007, L2-010). */
async function saveCuisines(req: Request, own: Own): Promise<void> {
  const c = own.caterer;
  const body = req.body ?? {};
  const chosenCuisines: unknown[] = Array.isArray(body.cuisines) ? body.cuisines : [];
  const chosenAreas: unknown[] = Array.isArray(body.areas) ? body.areas : [];
  const known = new Set((await allCuisines(req.tx)).filter((x) => !x.retired || c.cuisines.includes(x.id)).map((x) => x.id));
  const areaIds = new Set(ALL_AREAS.map((a) => a.id));
  if (chosenCuisines.some((x) => typeof x !== 'string' || !known.has(x)) || chosenAreas.some((x) => typeof x !== 'string' || !areaIds.has(x))) {
    fail(badRequest('Unknown cuisine or area'));
  }
  const errors: Record<string, string[]> = {};
  if (chosenCuisines.length < 1 || chosenCuisines.length > 5) errors['cuisines'] = ['Choose between 1 and 5 cuisines'];
  else if (typeof body.primaryCuisine !== 'string' || !chosenCuisines.includes(body.primaryCuisine)) errors['primaryCuisine'] = ['Mark one cuisine as primary'];
  if (chosenAreas.length < 1) errors['areas'] = ['Choose at least one area you serve'];
  else if (typeof body.primaryArea !== 'string' || !chosenAreas.includes(body.primaryArea)) errors['primaryArea'] = ['Choose your primary area'];
  if (hasErrors(errors)) fail(invalid(errors));

  const unique = (xs: string[]) => [...new Set(xs)];
  const areas = unique([body.primaryArea as string, ...(chosenAreas as string[])]);
  // The recent-changes feed has no cuisine field (ChangedField); areas are recorded.
  await recordLiveEdit(req, own, 'areas', areasValue(c.areas), areasValue(areas));
  c.cuisines = unique([body.primaryCuisine as string, ...(chosenCuisines as string[])]);
  c.areas = areas;
}

const WHOLE = /^\d+$/;
const GUESTS = 'Enter a whole number from 1 to 5,000';

function guests(raw: unknown): number | undefined {
  const v = typeof raw === 'number' ? String(raw) : text(raw);
  if (!WHOLE.test(v)) return undefined;
  const n = Number(v);
  return n >= 1 && n <= 5000 ? n : undefined;
}

/** Guest range and occasions from the fixed list (L2-020, L2-021). */
async function saveEvents(req: Request, own: Own): Promise<void> {
  const c = own.caterer;
  const body = req.body ?? {};
  const chosen: unknown[] = Array.isArray(body.occasions) ? body.occasions : [];
  const known = new Set(OCCASIONS.map((o) => o.id));
  // A value off the fixed list is a bad request and nothing is stored (L2-021.3).
  if (chosen.some((o) => typeof o !== 'string' || !known.has(o))) fail(badRequest('Unknown occasion'));
  const errors: Record<string, string[]> = {};
  const min = guests(body.minGuests);
  const max = guests(body.maxGuests);
  if (min === undefined) errors['minGuests'] = [GUESTS];
  if (max === undefined) errors['maxGuests'] = [GUESTS];
  if (min !== undefined && max !== undefined && min > max) errors['minGuests'] = ['Minimum guests can’t be more than maximum guests'];
  if (!chosen.length) errors['occasions'] = ['Choose at least one occasion'];
  if (hasErrors(errors)) fail(invalid(errors));

  const occasions = OCCASIONS.map((o) => o.id).filter((id) => chosen.includes(id));
  await recordLiveEdit(req, own, 'guests', guestsValue(c.minGuests, c.maxGuests), guestsValue(min!, max!));
  await recordLiveEdit(req, own, 'occasions', occasionsValue(c.occasions), occasionsValue(occasions));
  c.minGuests = min!;
  c.maxGuests = max!;
  c.occasions = occasions;
}

const SECTIONS: Record<string, (req: Request, own: Own) => Promise<void>> = { details: saveDetails, cuisines: saveCuisines, events: saveEvents };

/** `PUT /api/caterer/profile/sections/:section`: autosaved in a draft, live on a Published profile. */
export async function saveSection(req: Request): Promise<Reply> {
  const save = Object.hasOwn(SECTIONS, req.params['section']) ? SECTIONS[req.params['section']] : undefined;
  if (!save) return notFound();
  const own = await loadOwn(req);
  assertEditable(own.caterer);
  await save(req, own);
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}
