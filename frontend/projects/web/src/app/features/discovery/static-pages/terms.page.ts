import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Terms, /terms (docs/mocks/pages/terms). */
@Component({
  selector: 'app-terms-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article style="max-width: var(--layout-measure); margin-inline: auto">
      <div class="page-intro">
        <h1 i18n="@@terms.title">Terms</h1>
        <p class="subtitle" i18n="@@terms.version">Version 1.0 · in effect from Thursday 1 October 2026</p>
      </div>
      <div class="prose">
        <p i18n="@@terms.intro">These terms cover everyone who uses Sweet Hand. By creating an account you agree to them.</p>
        <h2 i18n="@@terms.everyoneTitle">For everyone</h2>
        <ul>
          <li i18n="@@terms.everyone1">Sweet Hand is for finding Caribbean caterers in Toronto and the GTA and sending them enquiries.</li>
          <li i18n="@@terms.everyone2">Be honest and respectful. Don’t post anything hateful, misleading or someone else’s photos.</li>
          <li i18n="@@terms.everyone3">Anyone can report a listing or review. Our team reviews every report.</li>
        </ul>
        <h2 i18n="@@terms.customersTitle">For customers</h2>
        <ul>
          <li i18n="@@terms.customers1">An enquiry is a question, not a booking. Price, deposit and payment are agreed directly with the caterer.</li>
          <li i18n="@@terms.customers2">You can review a caterer who replied to your enquiry, after your event, for up to 90 days.</li>
          <li i18n="@@terms.customers3">Up to 10 enquiries a day keeps caterers’ inboxes free of spam.</li>
        </ul>
        <h2 i18n="@@terms.caterersTitle">For caterers</h2>
        <ul>
          <li i18n="@@terms.caterers1">You must sell Caribbean food in Toronto or the GTA and hold a current food handler certificate.</li>
          <li i18n="@@terms.caterers2">Your profile goes live once our team approves it. Photos must be of your own food.</li>
          <li i18n="@@terms.caterers3">Food safety and licensing statements are your own. Sweet Hand does not inspect or certify kitchens.</li>
          <li i18n="@@terms.caterers4">We may edit, suspend or remove a profile that breaks these terms, and we’ll always tell you why.</li>
        </ul>
        <h2 i18n="@@terms.questionsTitle">Questions</h2>
        <p i18n="@@terms.questions">
          Email <a href="mailto:hello@sweethand.example">hello&#64;sweethand.example</a>. For privacy questions, see the <a routerLink="/privacy">privacy notice</a>.
        </p>
      </div>
    </article>
  `,
})
export class TermsPage {}
