/** A file to hand to a file picker. */
export interface PickedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}
