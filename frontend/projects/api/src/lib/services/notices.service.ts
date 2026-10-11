import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SiteNotice } from '../models/notices.models';
import type { INoticesService } from './notices.service.contract';

@Injectable()
export class NoticesService implements INoticesService {
  private readonly http = inject(HttpClient);

  current(): Observable<SiteNotice[]> {
    return this.http.get<SiteNotice[]>('/api/public/notices');
  }
}
