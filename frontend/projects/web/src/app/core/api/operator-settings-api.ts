import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { OperatorCuisine } from './operator-settings.models';

/**
 * The operator console's settings and moderation screens: cuisine list
 * (manage-cuisine-list), breach register (locate-data-and-record-breaches),
 * operator accounts (manage-operator-accounts), audit log (query-audit-log)
 * and held or hidden reviews (moderate-reviews).
 */
export abstract class OperatorSettingsApi {
  /** Every cuisine, active and retired, A to Z. */
  abstract cuisines(): Observable<OperatorCuisine[]>;
}

@Injectable()
export class HttpOperatorSettingsApi extends OperatorSettingsApi {
  private readonly http = inject(HttpClient);

  cuisines(): Observable<OperatorCuisine[]> {
    return this.http.get<OperatorCuisine[]>('/api/operator/cuisines');
  }
}
