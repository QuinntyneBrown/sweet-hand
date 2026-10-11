import type { Page } from '@playwright/test';

/** The full-screen photo viewer opened from the caterer page gallery (docs/mocks/dialogs/photo-viewer). */
export class PhotoViewer {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.locator('.viewer[role="dialog"]');
  }

  get count() {
    return this.dialog.locator('.viewer__count');
  }

  get caption() {
    return this.dialog.locator('.viewer__caption');
  }

  /** The photo on the stage: its image once loaded, otherwise its round placeholder. */
  get photo() {
    return this.dialog.locator('.viewer__stage .photo');
  }

  get image() {
    return this.photo.locator('img');
  }

  get closeButton() {
    return this.dialog.getByRole('button', { name: 'Close photo viewer' });
  }

  get previousButton() {
    return this.dialog.getByRole('button', { name: 'Previous photo' });
  }

  get nextButton() {
    return this.dialog.getByRole('button', { name: 'Next photo' });
  }

  get retryButton() {
    return this.dialog.getByRole('button', { name: 'Try again' });
  }

  get failedNote() {
    return this.caption.locator('.text-muted');
  }

  async press(key: 'ArrowRight' | 'ArrowLeft' | 'Home' | 'End' | 'Escape' | 'Tab') {
    await this.page.keyboard.press(key);
  }

  /** A horizontal swipe across the photo, as a finger would. */
  async swipe(direction: 'left' | 'right') {
    const stage = this.dialog.locator('.viewer__stage');
    const box = await stage.boundingBox();
    if (!box) throw new Error('No stage to swipe');
    const y = box.y + box.height / 2;
    const [from, to] = direction === 'left' ? [box.x + box.width * 0.7, box.x + box.width * 0.3] : [box.x + box.width * 0.3, box.x + box.width * 0.7];
    const init = { pointerType: 'touch', isPrimary: true, pointerId: 7, bubbles: true };
    await stage.dispatchEvent('pointerdown', { ...init, clientX: from, clientY: y });
    await stage.dispatchEvent('pointerup', { ...init, clientX: to, clientY: y });
  }

  /** Whether keyboard focus is somewhere inside the viewer. */
  async holdsFocus(): Promise<boolean> {
    return this.dialog.evaluate((el) => el.contains(document.activeElement));
  }
}
