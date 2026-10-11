export interface ReviewCertificateView {
  holder: string;
  issuer: string;
  number: string;
  /** YYYY-MM-DD. */
  expires: string;
  expired: boolean;
  fileName: string | null;
  fileSize: number | null;
}
