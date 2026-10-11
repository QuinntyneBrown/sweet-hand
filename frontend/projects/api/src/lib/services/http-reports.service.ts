import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { ReportRequest } from '../models/reports.models';
import { ReportsService } from './reports.service';

@Injectable()
export class HttpReportsService extends ReportsService {
  private readonly http = inject(HttpClient);

  submit(report: ReportRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>('/api/reports', report);
  }
}
