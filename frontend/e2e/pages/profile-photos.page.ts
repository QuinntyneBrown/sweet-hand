import { DashboardDialog, DashboardScreen } from './dashboard.page';

/** A file to hand to a file picker. */
export interface PickedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** A PNG whose header says how big it is; the server reads the size from the content (L2-041.1, L2-041.2). */
export function pngFile(name: string, width: number, height: number): PickedFile {
  const header = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header, 0);
  header.writeUInt32BE(13, 8);
  header.write('IHDR', 12, 'latin1');
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  return { name, mimeType: 'image/png', buffer: header };
}

/** A JPEG with a start-of-frame marker giving its size. */
export function jpegFile(name: string, width: number, height: number): PickedFile {
  const sof = Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 0xff, width >> 8, width & 0xff, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  return { name, mimeType: 'image/jpeg', buffer: Buffer.concat([Buffer.from([0xff, 0xd8]), sof]) };
}

/** A file named like a photo whose content is not an image (L2-041.3). */
export function fakeImage(name: string): PickedFile {
  return { name, mimeType: 'image/jpeg', buffer: Buffer.from('Menu: pelau, curry goat, macaroni pie', 'utf8') };
}

export function pdfFile(name: string, bytes = 1024): PickedFile {
  const buffer = Buffer.alloc(bytes, 0x20);
  buffer.write('%PDF-1.7\n', 0, 'latin1');
  return { name, mimeType: 'application/pdf', buffer };
}

/** Photos, /dashboard/profile/photos (docs/mocks/pages/profile-photos). */
export class ProfilePhotosPage extends DashboardScreen {
  readonly details = new DashboardDialog(this.page, 'Photo details');
  readonly remove = new DashboardDialog(this.page, /^(Remove this photo\?|Keep at least 3 photos)$/);
  readonly withdrawDialog = new DashboardDialog(this.page, 'Withdraw your submission?');

  async open() {
    await this.page.goto('/dashboard/profile/photos');
  }

  /** The "Add photos" file input (its label is the visible button). */
  get addPhotos() {
    return this.main.getByLabel('Add photos');
  }

  async upload(...files: PickedFile[]) {
    await this.addPhotos.setInputFiles(files);
  }

  get uploadHelp() {
    return this.main.locator('#upload-help');
  }

  get manager() {
    return this.main.getByRole('list', { name: 'Photos, in the order they appear on your page' });
  }

  get tiles() {
    return this.main.locator('.photo-manager .photo-tile');
  }

  tile(position: number) {
    return this.tiles.nth(position - 1);
  }

  get captions() {
    return this.main.locator('.photo-manager .photo-tile__caption');
  }

  get coverTags() {
    return this.main.locator('.photo-tile__cover');
  }

  moveUp(position: number) {
    return this.main.getByRole('button', { name: `Move photo ${position} up` });
  }

  moveDown(position: number) {
    return this.main.getByRole('button', { name: `Move photo ${position} down` });
  }

  edit(position: number) {
    return this.main.getByRole('button', { name: new RegExp(`^(Edit photo|Add caption to photo) ${position}$`) });
  }

  /** "Photo 3 moved to position 2." */
  get announcement() {
    return this.main.locator('.photo-manager + p[role="status"]');
  }

  progress(fileName: string) {
    return this.main.getByRole('progressbar', { name: `Uploading ${fileName}` });
  }

  cancelUpload(fileName: string) {
    return this.main.getByRole('button', { name: `Cancel upload of ${fileName}` });
  }

  get processing() {
    return this.main.locator('.photo-tile .status');
  }

  /** "2 photos weren’t added". */
  get uploadErrors() {
    return this.main.locator('#upload-errors');
  }

  get empty() {
    return this.main.locator('.empty:not(.empty--error)');
  }

  /** The Replace photo input inside the details dialog. */
  get replaceInput() {
    return this.details.root.getByLabel('Replace photo');
  }

  get caption() {
    return this.details.root.getByRole('textbox', { name: 'Caption' });
  }

  get useAsCover() {
    return this.details.root.getByRole('checkbox', { name: /^Use as cover photo/ });
  }
}
