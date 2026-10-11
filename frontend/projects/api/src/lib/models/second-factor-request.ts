/** The second step for operators: an authenticator code or a security key (L2-056.2). */
export type SecondFactorRequest = { method: 'authenticator app'; code: string } | { method: 'security key'; assertion: string };
