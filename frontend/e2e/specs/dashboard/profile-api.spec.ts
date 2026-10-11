import type { Page } from '@playwright/test';
import { test, expect } from '../../support/test';
import { WEB_URL } from '../../support/ports';

/** Calls the API as the signed-in browser does, with its session and CSRF cookie. */
async function api(page: Page, method: 'GET' | 'PUT' | 'POST', path: string, data?: unknown) {
  await page.request.get(`${WEB_URL}/api/session`);
  const token = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN')?.value ?? '';
  return page.request.fetch(`${WEB_URL}${path}`, { method, data, headers: { 'x-xsrf-token': token } });
}

test.describe('Caterer profile API rules', () => {
  test('L2-052.3: a caterer cannot respond to another caterer’s review', async ({ page, backend }) => {
    await backend.signInAs('kendra');

    const res = await api(page, 'POST', '/api/caterer/reviews/review-devon-maracas/response', { text: 'Not my review' });

    expect(res.status()).toBe(403);
    const { reviews } = await backend.state();
    expect(reviews.find((r: { id: string }) => r.id === 'review-devon-maracas').response).toBeUndefined();
  });

  test('L2-021.3: an occasion off the fixed list is a bad request and nothing is stored', async ({ page, backend }) => {
    await backend.signInAs('kendra');

    const res = await api(page, 'PUT', '/api/caterer/profile/sections/events', { minGuests: '20', maxGuests: '300', occasions: ['weddings', 'bar-crawls'] });

    expect(res.status()).toBe(400);
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').occasions).not.toContain('bar-crawls');
  });

  test('L2-039.3: submitting through the API lists every rule that failed', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'new' });
    await backend.signInAs('beverley');

    const res = await api(page, 'POST', '/api/caterer/profile/submission', {});

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.failed.map((f: { key: string }) => f.key)).toEqual(['email', 'description', 'cuisines', 'areas', 'guests', 'occasions', 'photos', 'menu', 'certificate']);
  });

  test('L2-043.4: a dish name of 81 characters is refused', async ({ page, backend }) => {
    await backend.signInAs('kendra');

    const res = await api(page, 'POST', '/api/caterer/profile/menu-items', { name: 'P'.repeat(81), description: '', tags: [], price: '' });

    expect(res.status()).toBe(400);
    expect((await res.json()).errors.name).toEqual(['Dish names are 2–80 characters']);
  });

  test('L2-038.4: a draft is not found by anyone but its owner', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'draft' });

    const res = await page.request.get(`${WEB_URL}/api/public/caterers/auntie-bevs-kitchen`);

    expect(res.status()).toBe(404);
  });

  test('L2-044.4: a suspended profile cannot be edited through the API', async ({ page, backend }) => {
    await backend.scenario('flying-fish-suspended');
    await backend.signInAs('sharon');

    const res = await api(page, 'PUT', '/api/caterer/profile/sections/details', { name: 'Flying Fish', description: 'x'.repeat(60) });

    expect(res.status()).toBe(409);
  });
});
