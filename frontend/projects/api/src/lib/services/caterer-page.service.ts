import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CatererPageView } from '../models/caterer-page.models';
import type { ICatererPageService } from './caterer-page.service.contract';

@Injectable()
export class CatererPageService implements ICatererPageService {
  private readonly http = inject(HttpClient);

  caterer(slug: string): Observable<CatererPageView> {
    return this.http.get<CatererPageView>(`/api/public/caterers/${encodeURIComponent(slug)}`);
  }
}
