import { Injectable } from '@angular/core';
import { SecurityKeyService } from './security-key.service';

/** Stands in for WebAuthn until the backend exists; the fake backend accepts its assertions. */
@Injectable()
export class LocalSecurityKeyService extends SecurityKeyService {
  assert(): Promise<string> {
    return Promise.resolve(`local-key:${crypto.randomUUID()}`);
  }
}
