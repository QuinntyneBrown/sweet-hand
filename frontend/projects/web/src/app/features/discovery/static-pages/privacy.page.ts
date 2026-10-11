import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The privacy notice, /privacy (docs/mocks/pages/privacy): what is collected
 * and why, who sees it, cookies, retention and the privacy officer's address
 * (L2-070.1, L2-073, L2-074.1, L2-075.3).
 */
@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article style="max-width: var(--layout-measure); margin-inline: auto">
      <div class="page-intro">
        <h1 i18n="@@privacy.title">Privacy notice</h1>
        <p class="subtitle" i18n="@@privacy.version">Version 1.0 · in effect from Thursday 1 October 2026</p>
      </div>
      <div class="prose">
        <p i18n="@@privacy.intro">
          Sweet Hand connects people planning events in Toronto and the GTA with Caribbean caterers. This notice explains what personal information we collect, why, who sees
          it, how long we keep it and how to reach us. We follow Canada’s Personal Information Protection and Electronic Documents Act (PIPEDA).
        </p>

        <h2 i18n="@@privacy.collectTitle">What we collect, and why</h2>
        <ul>
          <li i18n="@@privacy.collectAccount">
            <strong>Your account:</strong> display name, email, password (stored only as a secure hash) and, for caterers, business name and phone. To sign you in and let
            caterers and customers reach each other.
          </li>
          <li i18n="@@privacy.collectEnquiries">
            <strong>Enquiries and messages:</strong> event date, guests, area, occasion and what you write. To pass your enquiry to the caterer you chose.
          </li>
          <li i18n="@@privacy.collectPostal"><strong>Postal codes:</strong> we keep only the first three characters, to match you with nearby caterers.</li>
          <li i18n="@@privacy.collectCertificates"><strong>Food handler certificates:</strong> seen only by the caterer and our review team.</li>
          <li i18n="@@privacy.collectVisits"><strong>Visits:</strong> counted without cookies or third-party analytics, using a daily-changing code that can’t identify you.</li>
        </ul>

        <h2 i18n="@@privacy.whoTitle">Who sees it</h2>
        <p i18n="@@privacy.who">
          Caterers see your display name and enquiry, never your email or phone unless you choose to share them in that conversation. Our operators see records only to review
          profiles and handle reports, and every look is logged. We never sell personal information.
        </p>
        <p i18n="@@privacy.processors">
          We use two service providers. <strong>Northbound Mail Inc.</strong> sends our emails and processes them in <strong>Canada</strong>. Our bot check runs on servers in
          <strong>Canada</strong>. All of our data, backups and logs are stored in Canadian data centres.
        </p>

        <h2 i18n="@@privacy.cookiesTitle">Cookies</h2>
        <p i18n="@@privacy.cookies">We only set the three cookies Sweet Hand needs to work. There are no advertising or tracking cookies, so there is nothing to opt into.</p>
      </div>
      <div class="table-wrap" style="margin-block: var(--space-6)">
        <table class="table">
          <caption class="visually-hidden" i18n="@@privacy.cookiesCaption">Cookies Sweet Hand sets</caption>
          <thead>
            <tr>
              <th scope="col" i18n="@@privacy.cookie">Cookie</th>
              <th scope="col" i18n="@@privacy.why">Why</th>
              <th scope="col" i18n="@@privacy.lasts">Lasts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" i18n="@@privacy.sessionCookie">Session</th>
              <td i18n="@@privacy.sessionWhy">Keeps you signed in</td>
              <td i18n="@@privacy.sessionLasts">Up to 30 days</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.csrfCookie">Security token</th>
              <td i18n="@@privacy.csrfWhy">Stops other sites acting as you</td>
              <td i18n="@@privacy.csrfLasts">Your session</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.botCookie">Bot check</th>
              <td i18n="@@privacy.botWhy">Tells people from spam bots on forms</td>
              <td i18n="@@privacy.botLasts">24 hours</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="prose">
        <h2 i18n="@@privacy.retentionTitle">How long we keep it</h2>
      </div>
      <div class="table-wrap" style="margin-block: var(--space-6)">
        <table class="table">
          <caption class="visually-hidden" i18n="@@privacy.retentionCaption">How long Sweet Hand keeps personal information</caption>
          <thead>
            <tr>
              <th scope="col" i18n="@@privacy.information">Information</th>
              <th scope="col" i18n="@@privacy.keptFor">Kept for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" i18n="@@privacy.keepEnquiries">Enquiries and messages</th>
              <td i18n="@@privacy.keepEnquiriesFor">3 years after the enquiry closes</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.keepAccounts">Accounts nobody signs in to</th>
              <td i18n="@@privacy.keepAccountsFor">3 years after the last sign-in, with an email warning 30 days before</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.keepLogs">Security and access logs</th>
              <td i18n="@@privacy.keepLogsFor">13 months</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.keepCertificates">Food handler certificate files</th>
              <td i18n="@@privacy.keepCertificatesFor">90 days after they are replaced or the account is deleted</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.keepAudit">Operator audit log</th>
              <td i18n="@@privacy.keepAuditFor">7 years</td>
            </tr>
            <tr>
              <th scope="row" i18n="@@privacy.keepVisits">Visit counts (anonymous)</th>
              <td i18n="@@privacy.keepVisitsFor">25 months</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="prose">
        <h2 i18n="@@privacy.choicesTitle">Your choices</h2>
        <p i18n="@@privacy.choices">
          You can download everything we hold about you, or delete your account, from your account page at any time. Deleted information is gone within 30 days, and from
          backups within 35.
        </p>
        <h2 i18n="@@privacy.contactTitle">Contact our privacy officer</h2>
        <p i18n="@@privacy.contact">
          Write to <a href="mailto:privacy@sweethand.example">privacy&#64;sweethand.example</a>. If you aren’t satisfied with our answer, you can contact the Office of the
          Privacy Commissioner of Canada.
        </p>
      </div>
    </article>
  `,
})
export class PrivacyPage {}
