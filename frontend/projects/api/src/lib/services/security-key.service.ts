/**
 * The operator's WebAuthn security key (L2-056.2). The real implementation
 * asks the server for a challenge and calls `navigator.credentials.get`;
 * enrolment and the server's WebAuthn options are `<TO SUPPLY>` in the
 * sign-in design.
 */
export abstract class SecurityKeyService {
  /** An assertion from the operator's key, sent as the second factor. */
  abstract assert(): Promise<string>;
}
