/** What the platform knows about one session: the coarse device and when it was last used (L2-078.5). */
export interface SessionRecord {
  /** What the API calls the session; never the cookie value. */
  id: string;
  /** The session cookie value; seeded sessions on other devices have tokens no browser holds. */
  token: string;
  userId: string;
  device: string;
  createdAt: string;
  lastActiveAt: string;
}
