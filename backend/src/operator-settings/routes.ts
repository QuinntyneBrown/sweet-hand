import { admins, roles, type Area } from '../http/router.ts';
import { adminOnly, deactivateOperator, inviteOperator, listOperators } from './accounts.ts';
import { listBreaches, recordBreach } from './breaches.ts';
import { addCuisine, cuisineUsage, listCuisines, retireCuisine } from './cuisines.ts';

const operators = roles('Operator');
/** Admin-only routes tell an operator without Admin who to ask (L2-056.5). */
const adminOptions = { refusal: adminOnly };

/** Operator console settings and metrics (docs/detailed-designs/{discovery,moderation,metrics,privacy}). */
export const operatorSettingsArea: Area = (r) => {
  r.get('/api/operator/cuisines', operators, listCuisines);
  r.post('/api/operator/cuisines', operators, addCuisine);
  r.get('/api/operator/cuisines/:id/usage', operators, cuisineUsage);
  r.post('/api/operator/cuisines/:id/retire', operators, retireCuisine);
  r.get('/api/operator/breaches', operators, listBreaches);
  r.post('/api/operator/breaches', operators, recordBreach);
  r.get('/api/operator/accounts', admins, listOperators, adminOptions);
  r.post('/api/operator/accounts', admins, inviteOperator, adminOptions);
  r.post('/api/operator/accounts/:id/deactivate', admins, deactivateOperator, adminOptions);
};
