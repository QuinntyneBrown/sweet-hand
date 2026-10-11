export interface CertificateFileView {
  name: string;
  /** Bytes. */
  size: number;
  type: 'PDF' | 'JPEG' | 'PNG';
  uploadedAt: string;
}
