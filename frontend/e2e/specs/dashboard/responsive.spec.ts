import type { Page } from '@playwright/test';
import { test, expect } from '../../support/test';
import { ProfileDetailsPage } from '../../pages/profile-details.page';
import { ProfileCuisinesPage, ProfileEventsPage } from '../../pages/profile-sections.page';
import { ProfilePhotosPage } from '../../pages/profile-photos.page';
import { ProfileMenuPage } from '../../pages/profile-menu.page';
import { ProfileCertificatePage } from '../../pages/profile-certificate.page';
import { DashboardReviewsPage } from '../../pages/dashboard-reviews.page';

const screens = [
  { name: 'Business details', make: (p: Page) => new ProfileDetailsPage(p) },
  { name: 'Cuisines and areas', make: (p: Page) => new ProfileCuisinesPage(p) },
  { name: 'Guests and occasions', make: (p: Page) => new ProfileEventsPage(p) },
  { name: 'Photos', make: (p: Page) => new ProfilePhotosPage(p) },
  { name: 'Menu', make: (p: Page) => new ProfileMenuPage(p) },
  { name: 'Food safety', make: (p: Page) => new ProfileCertificatePage(p) },
  { name: 'Reviews', make: (p: Page) => new DashboardReviewsPage(p) },
];

test.describe('The caterer dashboard on a phone and on a desktop', () => {
  for (const screen of screens) {
    test(`L2-045 L2-064.2: ${screen.name} fits a 320 px phone and keeps its section navigation on a desktop`, async ({ page, backend }) => {
      await backend.signInAs('kendra');
      const view = screen.make(page);
      await page.setViewportSize({ width: 320, height: 720 });

      await view.open();

      await expect(view.heading).toHaveText(screen.name);
      await expect(view.sideNav).toBeHidden();
      await view.expectNoHorizontalScroll();
      await view.expectNoAccessibilityViolations();

      await page.setViewportSize({ width: 1280, height: 900 });
      await expect(view.sideNav).toBeVisible();
      await expect(view.navLink(screen.name)).toHaveAttribute('aria-current', 'page');
    });
  }
});
