/** A confirmed launch list address and the token the page keeps, in memory only, for "Remove my email" (L2-099.2). */
export interface LaunchConfirmation {
  email: string;
  removalToken: string;
}
