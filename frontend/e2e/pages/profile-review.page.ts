import { OperatorConsolePage } from './operator-console.page';

/** Reviewing a submitted profile or a name change, /admin/review/:id (docs/mocks/pages/admin-profile-review). */
export class ProfileReviewPage extends OperatorConsolePage {
  async goto(catererId: string) {
    await this.page.goto(`/admin/review/${catererId}`);
  }

  get backLink() {
    return this.workArea.getByRole('link', { name: 'Review queue' });
  }

  get subtitle() {
    return this.workArea.locator('.page-intro .subtitle');
  }

  get approve() {
    return this.workArea.getByRole('button', { name: /^Approve (and publish|name)$/ });
  }

  get requestChanges() {
    return this.workArea.getByRole('button', { name: 'Request changes' });
  }

  section(name: string) {
    return this.workArea.getByRole('region', { name });
  }

  get preview() {
    return this.section('As it will appear');
  }

  get photoCaptions() {
    return this.preview.locator('.photo-tile__caption');
  }

  get coverTags() {
    return this.preview.locator('.photo-tile__cover');
  }

  photoTile(caption: string) {
    return this.preview.locator('.photo-tile', { hasText: caption });
  }

  get newPhotoFlags() {
    return this.preview.locator('.photo-tile .changed-flag');
  }

  get previewName() {
    return this.preview.locator('.caterer-head h3');
  }

  get cuisines() {
    return this.preview.locator('.caterer-head__meta li');
  }

  get description() {
    return this.preview.locator('.prose p:not(:has(del))');
  }

  get descriptionFlag() {
    return this.preview.locator('.prose .changed-flag');
  }

  get removedText() {
    return this.preview.locator('.prose del.diff-old');
  }

  fact(term: string) {
    return this.preview.locator('.facts > div', { has: this.page.locator('dt', { hasText: term }) }).locator('dd');
  }

  get dishNames() {
    return this.preview.locator('.dish__name');
  }

  get regions() {
    return this.preview.locator('.regions > div');
  }

  get privateDetails() {
    return this.section('Private details');
  }

  detail(term: string) {
    return this.workArea.locator(`dl.kv dt:text-is("${term}") + dd`);
  }

  certificate(term: string) {
    return this.privateDetails.locator(`dl.certificate dt:text-is("${term}") + dd`);
  }

  get certificateFile() {
    return this.privateDetails.getByRole('button', { name: /^Open / });
  }

  /** Opens the certificate copy in a new tab (headless Chromium saves the PDF rather than showing it). */
  async openCertificate() {
    const popup = this.page.waitForEvent('popup');
    await this.certificateFile.click();
    await popup;
  }

  get rules() {
    return this.section('Submission rules').locator('.checklist li');
  }

  get rulesDone() {
    return this.section('Submission rules').locator('.checklist li .check--done');
  }

  get history() {
    return this.section('History').getByRole('list', { name: 'History, newest first' }).locator('li');
  }

  get resubmittedNote() {
    return this.workArea.locator('.alert').filter({ hasText: 'Resubmitted after changes were requested' });
  }

  get nameChangeNote() {
    return this.workArea.locator('.caterer-section .result-count').filter({ hasText: 'Until you decide' });
  }

  get cardPreview() {
    return this.section('Listing card after approval').locator('.caterer-card');
  }

  get loadingStatus() {
    return this.workArea.getByRole('status').filter({ hasText: 'Loading the profile' });
  }

  get errorAlert() {
    return this.workArea.getByRole('alert');
  }

  get retry() {
    return this.errorAlert.getByRole('button', { name: 'Retry' });
  }

  get backToQueue() {
    return this.errorAlert.getByRole('link', { name: 'Back to review queue' });
  }
}
