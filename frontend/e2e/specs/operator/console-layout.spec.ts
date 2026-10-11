import { test, expect } from '../../support/test';
import { OperatorConsolePage } from '../../pages/operator-console.page';

test.describe('Operator console frame', () => {
  test('side-nav: an Admin sees every operator section, the queue current with its count', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const console = new OperatorConsolePage(page);

    await console.open('/admin/queue');

    await expect(console.sideNavLinks).toHaveText([
      /^Review queue/,
      'Recent changes',
      'Caterers',
      'Reviews',
      'Metrics',
      'Audit log',
      'Cuisines',
      'Operators',
      'Breach register',
    ]);
    await expect(console.currentSideNavLink).toHaveAccessibleName('Review queue 8 waiting');
    await expect(console.sideNavLink('Audit log')).toHaveAttribute('href', '/admin/audit');
    await expect(console.main).toHaveClass('container');
  });

  test('L2-056.5: an operator without Admin is not offered "Audit log" or "Operators"', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const console = new OperatorConsolePage(page);

    await console.open('/admin/caterers');

    await expect(console.sideNavLinks).toHaveText([/^Review queue/, 'Recent changes', 'Caterers', 'Reviews', 'Metrics', 'Cuisines', 'Breach register']);
    await expect(console.currentSideNavLink).toHaveText('Caterers');
  });

  test('a section is opened from the side navigation', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const console = new OperatorConsolePage(page);
    await console.open('/admin/queue');

    await console.sideNavLink('Metrics').click();

    await expect(page).toHaveURL(/\/admin\/metrics$/);
    await expect(console.currentSideNavLink).toHaveText('Metrics');
  });

  test('/admin opens the review queue', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const console = new OperatorConsolePage(page);

    await console.open('/admin');

    await expect(page).toHaveURL(/\/admin\/queue$/);
  });
});
