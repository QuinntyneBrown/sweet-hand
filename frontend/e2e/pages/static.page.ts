import { BasePage } from './base.page';

/** Content pages: /about, /privacy, /terms (docs/mocks/pages/about, privacy, terms). */
export class StaticPage extends BasePage {
  async open(path: '/about' | '/privacy' | '/terms') {
    await this.page.goto(path);
  }

  get subtitle() {
    return this.page.locator('.page-intro .subtitle');
  }

  get sectionHeadings() {
    return this.main.getByRole('heading', { level: 2 });
  }

  get decorativePhotos() {
    return this.main.locator('.photo-row img');
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  /** The row headers of a table, named by its caption. */
  tableRows(caption: string) {
    return this.main.getByRole('table', { name: caption }).locator('tbody th[scope="row"]');
  }

  get text() {
    return this.main;
  }
}
