import type { Page } from '@playwright/test';

/** "Write a review" and "Edit your review" (docs/mocks/dialogs/review). */
export class ReviewDialog {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: /^(Write a review|Edit your review)$/ });
  }

  get title() {
    return this.dialog.locator('.dialog__title');
  }

  get description() {
    return this.dialog.locator('.dialog__desc');
  }

  get ratingGroup() {
    return this.dialog.getByRole('group', { name: 'Your rating' });
  }

  star(n: number) {
    return this.dialog.getByRole('radio', { name: n === 1 ? '1 star' : `${n} stars` });
  }

  /** How many stars are drawn filled. */
  get filledStars() {
    return this.dialog.locator('.star-input label[data-filled]');
  }

  get ratingError() {
    return this.dialog.locator('fieldset .field__error');
  }

  get text() {
    return this.dialog.getByRole('textbox', { name: 'Your review' });
  }

  get textError() {
    return this.dialog.locator('#text-error');
  }

  get counter() {
    return this.dialog.locator('.field__counter');
  }

  get summary() {
    return this.dialog.locator('.form-summary');
  }

  get alert() {
    return this.dialog.getByRole('alert');
  }

  get status() {
    return this.dialog.locator('.dialog__body > p[role="status"]');
  }

  get post() {
    return this.dialog.getByRole('button', { name: 'Post review' });
  }

  get save() {
    return this.dialog.getByRole('button', { name: 'Save changes' });
  }

  get tryAgain() {
    return this.dialog.getByRole('button', { name: 'Try again' });
  }

  get cancel() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  get close() {
    return this.dialog.getByRole('button', { name: 'Close' });
  }

  get done() {
    return this.dialog.getByRole('button', { name: 'Done' });
  }

  get seeYourReview() {
    return this.dialog.getByRole('button', { name: 'See your review' });
  }

  get outcomeTitle() {
    return this.dialog.locator('.empty__title');
  }

  get outcomeText() {
    return this.dialog.locator('.empty__text');
  }

  /** Click a star, as a person does: the radio itself is visually hidden behind it. */
  async rate(stars: number) {
    await this.dialog.locator(`.star-input label[for="star-${stars}"]`).click();
  }

  async write(stars: number | null, text: string) {
    if (stars) await this.rate(stars);
    await this.text.fill(text);
  }
}
