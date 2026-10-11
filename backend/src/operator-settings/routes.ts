import { roles, type Area } from '../http/router.ts';
import { listBreaches, recordBreach } from './breaches.ts';
import { addCuisine, cuisineUsage, listCuisines, retireCuisine } from './cuisines.ts';

const operators = roles('Operator');

/** Operator console settings and metrics (docs/detailed-designs/{discovery,moderation,metrics,privacy}). */
export const operatorSettingsArea: Area = (r) => {
  r.get('/api/operator/cuisines', operators, listCuisines);
  r.post('/api/operator/cuisines', operators, addCuisine);
  r.get('/api/operator/cuisines/:id/usage', operators, cuisineUsage);
  r.post('/api/operator/cuisines/:id/retire', operators, retireCuisine);
  r.get('/api/operator/breaches', operators, listBreaches);
  r.post('/api/operator/breaches', operators, recordBreach);
};
