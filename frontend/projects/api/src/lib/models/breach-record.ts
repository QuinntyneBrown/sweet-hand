/** One record of the breach register (L2-075.2). */
export interface BreachRecord {
  id: string;
  title: string;
  /** YYYY-MM-DD, the day the breach was confirmed. */
  confirmedOn: string;
  recordedAt: string;
  recordedBy: string;
  information: string;
  peopleAffected: number;
  riskAssessment: string;
  notificationDecision: string;
}
