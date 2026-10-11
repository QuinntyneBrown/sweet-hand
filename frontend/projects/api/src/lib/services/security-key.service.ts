import { Injectable } from '@angular/core';
import type { ISecurityKeyService } from './security-key.service.contract';

/** Stands in for WebAuthn until the backend exists; the fake backend accepts its assertions. */
@Injectable()
export class SecurityKeyService implements ISecurityKeyService {
  assert(): Promise<string> {
    return Promise.resolve(`local-key:${crypto.randomUUID()}`);
  }
}
