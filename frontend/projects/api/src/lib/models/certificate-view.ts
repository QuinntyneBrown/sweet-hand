import type { CertificateFileView } from './certificate-file-view';

export interface CertificateView {
  holder: string;
  issuer: string;
  number: string;
  /** YYYY-MM-DD. */
  expires: string;
  savedAt: string;
  file: CertificateFileView | null;
}
