/** A file sent as base64; the server checks its content, not its name (L2-041.3). */
export interface UploadRequest {
  fileName: string;
  /** Base64 of the file's bytes. */
  data: string;
}
