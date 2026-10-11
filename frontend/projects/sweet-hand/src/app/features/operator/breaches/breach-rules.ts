import { type RecordBreachRequest } from '@sweet-hand/api';
import type { BreachErrors } from './breach-errors';

export type BreachField = 'date' | 'what' | 'people' | 'risk' | 'decision';

/** A breach record needs every part L2-075.2 lists; the server applies the same rules. */
export function breachErrors(r: RecordBreachRequest, today: string): BreachErrors {
  const errors: BreachErrors = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) errors.date = $localize`:@@recordBreach.dateRequired:Enter the date the breach was confirmed`;
  else if (r.date > today) errors.date = $localize`:@@recordBreach.dateFuture:The date can’t be in the future`;
  if (!r.what.trim()) errors.what = $localize`:@@recordBreach.whatRequired:Describe what happened`;
  if (!/^\d+$/.test(r.people.trim())) errors.people = $localize`:@@recordBreach.peopleNumber:Enter the number of people affected as a whole number`;
  if (!r.risk) errors.risk = $localize`:@@recordBreach.riskRequired:Choose the risk of significant harm`;
  if (!r.decision) errors.decision = $localize`:@@recordBreach.decisionRequired:Choose a notification decision`;
  return errors;
}
