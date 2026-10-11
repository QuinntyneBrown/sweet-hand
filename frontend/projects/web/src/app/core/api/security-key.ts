import { Injectable } from '@angular/core';

/**
 * The operator's WebAuthn security key (L2-056.2). The real implementation
 * asks the server for a challenge and calls `navigator.credentials.get`;
 * enrolment and the server's WebAuthn options are `<TO SUPPLY>` in the
 * sign-in design.
 */
export abstract class SecurityKey {
  /** An assertion from the operator's key, sent as the second factor. */
  abstract assert(): Promise<string>;
}

/** Stands in for WebAuthn until the backend exists; the fake backend accepts its assertions. */
@Injectable()
export class LocalSecurityKey extends SecurityKey {
  assert(): Promise<string> {
    return Promise.resolve(`local-key:${crypto.randomUUID()}`);
  }
}
