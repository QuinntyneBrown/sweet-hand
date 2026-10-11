import type { BreachInformation } from './breach-information';

export interface RecordBreachRequest {
  date: string;
  what: string;
  information: BreachInformation[];
  /** Whole number as typed; the server rejects anything else. */
  people: string;
  risk: 'low' | 'real' | null;
  riskNotes: string;
  decision: 'report' | 'not' | null;
}
