import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, startApi } from '../support/api.ts';

const priya = { displayName: 'Priya Singh', email: 'priya.singh@example.com', password: 'tamarind-balls-2026', consent: true, challengeToken: 'local:register:1' };
const bev = {
  businessName: 'Bev’s Sunday Kitchen',
  contactName: 'Beverley Campbell',
  email: 'beverley@auntiebevs.example',
  phone: '(905) 555-0164',
  password: 'sorrel-and-ginger-26',
  sellsCaribbeanFoodInGta: true,
  acceptsTermsAndPrivacyNotice: true,
  challengeToken: 'local:register-caterer:1',
};

describe('customer registration (L2-023, L2-070.2, L2-076.1)', () => {
  it('Given valid details, when a visitor registers, then a customer account waits for verification and a link is emailed', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/registrations', { ...priya, role: 'Operator' });
    assert.equal(res.status, 202);
    const user = (await documents(api, 'users')).find((u) => u.email === priya.email);
    assert.equal(user.role, 'Customer', 'the role is never read from the body (L2-079.2)');
    assert.equal(user.emailVerified, false);
    assert.equal(user.acceptedPrivacyVersion, '2026-03');
    assert.equal(user.acceptedPrivacyAt, '2026-10-10T14:00:00.000Z');
    assert.notEqual(user.passwordHash, priya.password);
    const [mail] = await outbox(api);
    assert.equal(mail.to, priya.email);
    assert.equal(mail.kind, 'verify-email');
    assert.match(mail.link!, /^\/verify-email\/[\w-]{40,}$/);
  });

  it('Given invalid details, when a visitor registers, then each field explains its rule', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/registrations', { displayName: 'P', email: 'not-an-email', password: 'short', consent: false, challengeToken: 'local:register:1' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, {
      name: ['Enter a display name of 2 to 50 characters'],
      email: ['Enter an email address like name@example.com'],
      password: ['Use 12 to 128 characters'],
      consent: ['Tick the box to agree to the privacy notice'],
    });
  });

  it('Given a commonly breached password, when it is set, then it is rejected (L2-076.1)', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/registrations', { ...priya, password: 'Password1234' });
    assert.deepEqual(res.body.errors, { password: ['This password is too common'] });
  });

  it('Given no bot-protection token, when a visitor registers, then nothing is created (L2-082.2)', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/registrations', { ...priya, challengeToken: 'forged' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { challengeToken: ['Confirm you’re a person'] });
  });

  it('Given an email that already has an account, when someone registers with it, then the answer is the same and the owner is told by email', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/registrations', { ...priya, email: 'Marcia.T@example.com' });
    assert.equal(res.status, 202);
    assert.equal((await documents(api, 'users')).filter((u) => u.emailKey === 'marcia.t@example.com').length, 1);
    assert.deepEqual((await outbox(api)).map((m) => [m.to, m.kind]), [['marcia.t@example.com', 'registration-attempt']]);
  });
});

describe('caterer registration (L2-037)', () => {
  it('Given valid details, when a caterer registers, then they get an account, a draft profile, a verification email and a session', async () => {
    const api = await startApi();
    const client = api.client();
    const res = await client.post('/api/identity/registrations/caterer', { ...bev, status: 'Published' });
    assert.equal(res.status, 202);
    const user = (await documents(api, 'users')).find((u) => u.email === bev.email);
    assert.equal(user.role, 'Caterer');
    assert.equal(user.displayName, 'Beverley Campbell');
    assert.equal(user.phone, '+19055550164');
    const caterer = (await documents(api, 'caterers')).find((c) => c.id === user.catererId);
    assert.equal(caterer.name, 'Bev’s Sunday Kitchen');
    assert.equal(caterer.slug, 'bevs-sunday-kitchen');
    assert.equal(caterer.status, 'Draft');
    assert.equal(caterer.ownerUserId, user.id);
    assert.deepEqual((await outbox(api)).map((m) => m.kind), ['verify-email']);
    const session = await client.get('/api/session');
    assert.deepEqual(session.body.user.caterer, { id: caterer.id, name: 'Bev’s Sunday Kitchen', slug: 'bevs-sunday-kitchen', status: 'Draft' });
  });

  it('Given invalid details, when a caterer registers, then each field explains its rule', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/registrations/caterer', {
      ...bev,
      businessName: 'A',
      contactName: '',
      phone: '555-0164',
      sellsCaribbeanFoodInGta: false,
      acceptsTermsAndPrivacyNotice: false,
    });
    assert.deepEqual(res.body.errors, {
      business: ['Enter a business name of 2 to 80 characters'],
      contact: ['Enter your name, 2 to 50 characters'],
      phone: ['Enter a 10-digit Canadian phone number'],
      sells: ['Confirm that you sell Caribbean food in Toronto or the GTA'],
      terms: ['Accept the caterer terms and privacy notice to continue'],
    });
  });

  it('Given an email that already has an account, when a caterer registers with it, then the answer is the same, with no session', async () => {
    const api = await startApi();
    const client = api.client();
    const res = await client.post('/api/identity/registrations/caterer', { ...bev, email: 'marcia.t@example.com' });
    assert.equal(res.status, 202);
    assert.equal(client.cookies.get('sh_session'), undefined);
    assert.deepEqual((await outbox(api)).map((m) => m.kind), ['registration-attempt']);
  });
});
