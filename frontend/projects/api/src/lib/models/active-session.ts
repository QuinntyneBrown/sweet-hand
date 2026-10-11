/** One signed-in session (L2-078.5). The id is not the session cookie. */
export interface ActiveSession {
  id: string;
  /** Coarse device type, "Safari on iPhone". */
  device: string;
  lastActiveAt: string;
  current: boolean;
}
