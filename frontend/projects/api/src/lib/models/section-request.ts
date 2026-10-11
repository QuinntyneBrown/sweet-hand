import type { DetailsRequest } from './details-request';
import type { CuisinesRequest } from './cuisines-request';
import type { EventsRequest } from './events-request';

export type SectionRequest = { section: 'details'; values: DetailsRequest } | { section: 'cuisines'; values: CuisinesRequest } | { section: 'events'; values: EventsRequest };
