import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CatererPageView } from '../models/caterer-page-view';
import { CatererPageService } from './caterer-page.service';

@Injectable()
export class HttpCatererPageService extends CatererPageService {
  private readonly http = inject(HttpClient);

  caterer(slug: string): Observable<CatererPageView> {
    return this.http.get<CatererPageView>(`/api/public/caterers/${encodeURIComponent(slug)}`);
  }
}
