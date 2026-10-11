export interface Certificate {
  holder: string;
  issuer: string;
  number: string;
  expires: string;
  fileName?: string;
  fileSize?: number;
  /** When the details were last saved, and when the copy was uploaded (provide-food-handler-certificate design). */
  savedAt?: string;
  fileUploadedAt?: string;
  fileType?: 'PDF' | 'JPEG' | 'PNG';
}
