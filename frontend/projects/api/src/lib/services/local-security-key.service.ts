import { Injectable } from '@angular/core';
import { SecurityKeyService } from './security-key.service';

/** Stands in for WebAuthn until it is supplied; the backend's local verifier accepts its assertions (ADR 0009). */
@Injectable()
export class LocalSecurityKeyService extends SecurityKeyService {
  assert(): Promise<string> {
    return Promise.resolve(`local-key:${crypto.randomUUID()}`);
  }
}
