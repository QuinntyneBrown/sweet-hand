import { test, expect } from '../../../support/test';
import { ProfileReviewPage } from '../../../pages/profile-review.page';

test.describe('Profile review', () => {
  test('L2-047.2: a submitted profile shows as it will appear publicly, with the private details and certificate', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);

    await review.goto('cat-910');

    await expect(review.heading).toHaveText('Auntie Bev’s Kitchen');
    await expect(review.subtitle).toHaveText('Pending review · Submitted Wed 7 Oct at 2:10 p.m. · waiting 3 days');
    await expect(review.backLink).toHaveAttribute('href', '/admin/queue');
    await expect(review.photoCaptions).toHaveText([
      'Brown stew chicken with rice and peas in a steel pot',
      'Rice and peas with stewed chicken in a red pot',
      'Curry goat over white rice',
      'Fried dumplings dusted with sugar',
      'Escovitch-style peppers over rice',
    ]);
    await expect(review.coverTags).toHaveCount(1);
    await expect(review.photoTile('Brown stew chicken').locator('.photo-tile__cover')).toHaveText('Cover');
    await expect(review.previewName).toHaveText('Auntie Bev’s Kitchen');
    await expect(review.cuisines).toHaveText(['Jamaican']);
    await expect(review.description.first()).toContainText('Beverley Campbell has cooked for every christening');
    await expect(review.fact('Guests')).toHaveText('Serves 30–150 guests');
    await expect(review.fact('Occasions').locator('li')).toHaveText(['Birthdays', 'Funerals and repasts', 'Family gatherings', 'Community events']);
    await expect(review.dishNames).toHaveText(['Brown stew chicken', 'Curry goat', 'Rice and peas', 'Escovitch fish', 'Fried dumplings', 'Gizzada']);
    await expect(review.regions).toHaveText(['DurhamOshawa, Whitby, Clarington, Ajax']);

    await expect(review.detail('Contact')).toHaveText('Beverley Campbell');
    await expect(review.detail('Email')).toHaveText(/^beverley@auntiebevs\.example\s*Verified$/);
    await expect(review.detail('Phone')).toHaveText('+1 905 555 0164');
    await expect(review.certificate('Holder')).toHaveText('Beverley Campbell');
    await expect(review.certificate('Issued by')).toHaveText('Durham Region Health Department');
    await expect(review.certificate('Number')).toHaveText('FH-2025-204517');
    await expect(review.certificate('Expires')).toHaveText('22 Jan 2030');
    await expect(review.certificateFile).toHaveText('Open food-handler-certificate.pdf · 1.2 MB');
    await expect(review.rules).toHaveText([
      'Email verified',
      '5 photos, each with a caption, cover chosen',
      '6 dishes',
      'Description, cuisines, areas, guests and occasions',
      'Food handler certificate valid',
    ]);
    await expect(review.rulesDone).toHaveCount(5);
    await expect(review.history).toHaveText(['Wed 7 Oct, 2:10 p.m.Submitted for review by Beverley Campbell', 'Mon 28 Sep, 8:47 p.m.Draft created']);
    await expect(review.approve).toHaveText('Approve and publish');
    await review.expectNoAccessibilityViolations();
  });

  test('L2-040.4: the certificate copy opens through a link that expires within 5 minutes', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    await review.goto('cat-910');

    await review.openCertificate();

    const signed = async () => (await backend.requests()).find((r) => r.path.startsWith('/api/operator/certificate-files/'));
    await expect.poll(async () => (await signed())?.path).toMatch(/^\/api\/operator\/certificate-files\/[0-9a-f]{32}$/);
    expect((await signed())?.query).toContain('expires=2026-10-10T14%3A05%3A00.000Z');
  });

  test('L2-047.3: a resubmitted profile restates the request and highlights what changed since', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);

    await review.goto('cat-911');

    await expect(review.subtitle).toHaveText('Pending review · Resubmitted Thu 8 Oct at 9:15 a.m. · waiting 2 days');
    await expect(review.resubmittedNote).toContainText('Resubmitted after changes were requested');
    await expect(review.resubmittedNote).toContainText(
      'Tomas Reyes on Mon 5 Oct: “The description lists a phone number, and photo 3 is a stock image. Please remove the number and upload a photo of your own food.” 2 fields changed since.',
    );
    await expect(review.newPhotoFlags).toHaveCount(1);
    await expect(review.photoTile('Pelau with pigeon peas').locator('.changed-flag')).toHaveText('New photo');
    await expect(review.descriptionFlag).toHaveText('Changed since changes were requested');
    await expect(review.removedText).toHaveText('Call or text Jolene at 647-555-0119 to book.');
    await expect(review.history).toHaveCount(4);
    await expect(review.history.nth(1)).toContainText(
      'Changes requested by Tomas Reyes: “The description lists a phone number, and photo 3 is a stock image. Please remove the number and upload a photo of your own food.”',
    );
    await review.expectNoAccessibilityViolations();
  });

  test('L2-044.2: a name change shows old and new names, the new address and the listing card after approval', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);

    await review.goto('cat-001');

    await expect(review.heading).toHaveText(/^Pelau House →\s?renamed to Pelau House by Kendra$/);
    await expect(review.subtitle).toHaveText('Published · Name change · waiting 1 day');
    await expect(review.detail('Current name')).toHaveText('Pelau House');
    await expect(review.detail('Requested name')).toHaveText('Pelau House by Kendra');
    await expect(review.detail('Page address')).toHaveText(/^\/caterers\/pelau-house → \/caterers\/pelau-house-by-kendra\s*The old address redirects$/);
    await expect(review.detail('Requested by')).toHaveText('Kendra Baptiste · Fri 9 Oct at 6:20 p.m.');
    await expect(review.nameChangeNote).toHaveText('Until you decide, the public page keeps showing “Pelau House”.');
    await expect(review.cardPreview.locator('.caterer-card__name')).toHaveText('Pelau House by Kendra');
    await expect(review.history).toHaveText(['Fri 9 Oct, 6:20 p.m.Name change requested by Kendra Baptiste', 'Fri 14 Mar 2025, 11:20 a.m.Published by Tomas Reyes']);
    await expect(review.approve).toHaveText('Approve name');
    await expect(review.requestChanges).toBeVisible();
    await review.expectNoAccessibilityViolations();
  });

  test('loading: skeletons while the profile loads, decisions unavailable', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/queue/profiles/cat-910');
    const review = new ProfileReviewPage(page);

    await review.goto('cat-910');

    await expect(review.loadingStatus).toBeAttached();
    await expect(review.approve).toBeDisabled();
    await expect(review.requestChanges).toBeDisabled();
    await review.expectNoAccessibilityViolations();
    await backend.release();
    await expect(review.heading).toHaveText('Auntie Bev’s Kitchen');
  });

  test('error: the profile fails to load; no decision is recorded and Retry loads it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/queue/profiles/cat-910', { status: 500, times: 1 });
    const review = new ProfileReviewPage(page);

    await review.goto('cat-910');

    await expect(review.heading).toHaveText('Profile review');
    await expect(review.subtitle).toHaveText('Didn’t load');
    await expect(review.errorAlert).toContainText('We couldn’t load this profile');
    await expect(review.errorAlert).toContainText('No decision has been recorded. Try again, or go back to the queue.');
    await expect(review.backToQueue).toHaveAttribute('href', '/admin/queue');
    await review.expectNoAccessibilityViolations();
    await review.retry.click();
    await expect(review.heading).toHaveText('Auntie Bev’s Kitchen');
  });

  test('L2-064: on a phone the review reads top to bottom without scrolling sideways', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    await review.usePhone();

    await review.goto('cat-911');

    await expect(review.photoCaptions).toHaveCount(5);
    await review.expectNoHorizontalScroll();
    await review.expectNoAccessibilityViolations();
  });
});
