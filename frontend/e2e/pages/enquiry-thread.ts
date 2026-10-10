import type { Locator, Page } from '@playwright/test';

/**
 * One enquiry thread as both parties see it (docs/specs/components/message.md):
 * head, actions, summary, messages, reply box and how it ends.
 */
export class EnquiryThread {
  constructor(private readonly page: Page) {}

  get root() {
    return this.page.locator('article.thread');
  }

  get heading() {
    return this.root.locator('.thread__title').getByRole('heading');
  }

  get loadingHeading() {
    return this.root.getByRole('heading', { name: 'Loading enquiry' });
  }

  get backLink() {
    return this.root.locator('a.eyebrow');
  }

  get partyPicture() {
    return this.root.locator('.thread__head > .photo img, .thread__head > .avatar').first();
  }

  get status() {
    return this.root.locator('.thread__status .status');
  }

  get statusLine() {
    return this.root.locator('.thread__status');
  }

  get viewCaterer() {
    return this.root.locator('.thread__status').getByRole('link', { name: 'View caterer' });
  }

  get actions() {
    return this.root.locator('.thread__actions');
  }

  action(name: string) {
    return this.actions.getByRole('button', { name, exact: true });
  }

  get actionButtons() {
    return this.actions.getByRole('button');
  }

  get sharedStatus() {
    return this.actions.locator('.inline-status');
  }

  summaryValue(term: string) {
    return this.root.locator('.enquiry-summary > div').filter({ has: this.page.locator('dt', { hasText: term }) }).locator('dd');
  }

  get enquiryMessage() {
    return this.root.locator('.enquiry-summary__message dd p.measure');
  }

  get enquiryBy() {
    return this.root.locator('.enquiry-summary__by');
  }

  get fitWarnings() {
    return this.root.locator('.field__warning');
  }

  get messageList() {
    return this.root.getByRole('list', { name: 'Messages' });
  }

  get messages() {
    return this.root.locator('ol.messages li.message');
  }

  get bubbles() {
    return this.messages.locator('.message__bubble');
  }

  messageAt(index: number) {
    return this.messages.nth(index);
  }

  get theirs() {
    return this.root.locator('li.message--theirs');
  }

  get mine() {
    return this.root.locator('li.message--mine');
  }

  get system() {
    return this.root.locator('li.message--system');
  }

  get pending() {
    return this.root.locator('li.message--pending');
  }

  get failed() {
    return this.root.locator('li.message--failed');
  }

  metaOf(message: Locator) {
    return message.locator('.message__meta');
  }

  bubbleOf(message: Locator) {
    return message.locator('.message__bubble');
  }

  senderOf(message: Locator) {
    return message.locator('.visually-hidden').first();
  }

  get contactCards() {
    return this.root.locator('.contact-card');
  }

  get closedNote() {
    return this.root.locator('.closed-note');
  }

  get privateNote() {
    return this.root.locator('.private-note');
  }

  get replyBox() {
    return this.root.locator('form.reply-box');
  }

  get replyLabel() {
    return this.replyBox.locator('.reply-box__label');
  }

  get replyField() {
    return this.replyBox.locator('textarea');
  }

  get replyHelp() {
    return this.replyBox.locator('.field__help');
  }

  get replyError() {
    return this.replyBox.locator('.field__error');
  }

  get replyCounter() {
    return this.replyBox.locator('.field__counter');
  }

  get replySummary() {
    return this.replyBox.locator('.form-summary');
  }

  get sendButton() {
    return this.replyBox.getByRole('button', { name: /^Send/ });
  }

  async reply(text: string) {
    await this.replyField.fill(text);
    await this.sendButton.click();
  }

  get emptyState() {
    return this.root.locator('.empty');
  }

  get emptyTitle() {
    return this.emptyState.locator('.empty__title');
  }

  get emptyText() {
    return this.emptyState.locator('.empty__text');
  }

  emptyAction(name: string) {
    return this.emptyState.getByRole('link', { name }).or(this.emptyState.getByRole('button', { name }));
  }

  get emptyReference() {
    return this.emptyState.locator('.text-caption code');
  }
}

/** A thread's confirmation dialogs: share contact, close and decline (docs/mocks/dialogs). */
export class EnquiryDialog {
  constructor(
    private readonly page: Page,
    private readonly title: string | RegExp,
  ) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: this.title });
  }

  get heading() {
    return this.dialog.locator('.dialog__title');
  }

  get description() {
    return this.dialog.locator('.dialog__desc');
  }

  get icon() {
    return this.dialog.locator('.dialog__icon');
  }

  get panel() {
    return this.dialog.locator('.dialog__panel');
  }

  get closeButton() {
    return this.dialog.locator('.dialog__header').getByRole('button', { name: 'Close' });
  }

  button(name: string) {
    return this.dialog.locator('.dialog__footer').getByRole('button', { name, exact: true });
  }

  get card() {
    return this.dialog.locator('.contact-card');
  }

  get alert() {
    return this.dialog.locator('.alert');
  }

  get busyStatus() {
    return this.dialog.locator('.dialog__body > [role="status"]');
  }

  get note() {
    return this.dialog.getByRole('textbox', { name: /^Note to/ });
  }

  get noteHelp() {
    return this.dialog.locator('.field__help');
  }

  get noteError() {
    return this.dialog.locator('.field__error');
  }

  get noteCounter() {
    return this.dialog.locator('.field__counter');
  }

  get summary() {
    return this.dialog.locator('.form-summary');
  }
}

/** Toasts raised from enquiry screens (docs/mocks/notifications/toast). */
export class Toasts {
  constructor(private readonly page: Page) {}

  get all() {
    return this.page.locator('.toast-region .toast');
  }

  withTitle(title: string) {
    return this.all.filter({ has: this.page.locator('.toast__title', { hasText: title }) });
  }

  textOf(toast: Locator) {
    return toast.locator('.toast__text');
  }

  action(toast: Locator, name: string) {
    return toast.getByRole('button', { name }).or(toast.getByRole('link', { name }));
  }
}
