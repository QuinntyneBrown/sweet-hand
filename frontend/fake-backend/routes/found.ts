import type { User } from '../seed/user.ts';
import type { Enquiry } from '../seed/enquiry.ts';
import type { Party } from '../../projects/api/src/lib/models/party.ts';

export type Found = { user: User; e: Enquiry; party: Party };
