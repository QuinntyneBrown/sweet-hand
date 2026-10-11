/**
 * Translated copy for a photo tile (photo-tile CRD, API). `{n}` is the
 * position and `{file}` the uploaded file's name; `{pct}` the percent sent.
 */
export interface PhotoTileLabels {
  /** "Cover" */
  cover: string;
  /** "Move photo {n} up" */
  moveUp: string;
  /** "Move photo {n} down" */
  moveDown: string;
  /** "Edit" */
  edit: string;
  /** " photo {n}" */
  editObject: string;
  /** "Add a caption" */
  missingCaption: string;
  /** "Add caption" */
  addCaption: string;
  /** " to photo {n}" */
  addCaptionObject: string;
  /** "Uploading {file}" */
  uploading: string;
  /** "{pct}%, uploading" */
  uploadingValue: string;
  /** "Cancel" */
  cancel: string;
  /** " upload of {file}" */
  cancelObject: string;
  /** "Processing" */
  processing: string;
}
