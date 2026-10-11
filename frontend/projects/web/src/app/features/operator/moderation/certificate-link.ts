import type { ModerationApi } from '../../../core/api/operator-moderation-api';

/** Opens a caterer's certificate copy in a new tab through a link that expires within 5 minutes (L2-040.4). */
export function openCertificate(api: ModerationApi, catererId: string): void {
  window.open(api.certificateUrl(catererId), '_blank', 'noopener');
}
