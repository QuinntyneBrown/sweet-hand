import type { ResolveAction } from './resolve-action';

export interface ResolveReportRequest {
  decision: 'dismiss' | 'action';
  action?: ResolveAction;
  note: string;
}
