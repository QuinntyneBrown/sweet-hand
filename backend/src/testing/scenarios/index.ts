import type { Scenarios } from '../scenario.ts';
import { identityScenarios } from './identity.ts';
import { discoveryScenarios } from './discovery.ts';
import { moderationScenarios } from './moderation.ts';

/** Every area's scenarios (ADR 0008). Names are unique across areas. */
export const allScenarios: Scenarios = {
  ...identityScenarios,
  ...discoveryScenarios,
  ...moderationScenarios,
};
