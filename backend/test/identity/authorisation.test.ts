import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Client } from '../support/api.ts';
import { productAreas } from '../../src/areas.ts';
import { Router, roles, type Area, type Role } from '../../src/http/router.ts';

const ACCOUNTS: Record<Role, string> = {
  Customer: 'marcia.t@example.com',
  Caterer: 'kendra@pelauhouse.example',
  Operator: 'tomas@sweethand.example', // an operator without the Admin permission
};

describe('authorisation (L2-079)', () => {
  it('Given every API endpoint, when each role it does not allow calls it, then the answer is 401 for visitors and 403 for signed-in roles (L2-079.3)', async () => {
    const api = await startApi();
    const catalog = new Router();
    for (const area of productAreas) area(catalog);
    const clients: Record<Role, Client> = {
      Customer: await signedInClient(api, ACCOUNTS.Customer),
      Caterer: await signedInClient(api, ACCOUNTS.Caterer),
      Operator: await signedInClient(api, ACCOUNTS.Operator),
    };
    let checked = 0;
    for (const route of catalog.routes) {
      if (route.policy.kind === 'anonymous') continue;
      const path = route.path.replace(/:[A-Za-z]+/g, 'x');
      const visitor = await api.client().request(route.method, path, route.method === 'GET' ? undefined : {});
      assert.equal(visitor.status, 401, `${route.method} ${route.path} for a visitor`);
      for (const role of Object.keys(ACCOUNTS) as Role[]) {
        const allowed = route.policy.roles.includes(role) && !(route.policy.admin && role === 'Operator');
        if (allowed) continue;
        const res = await clients[role].request(route.method, path, route.method === 'GET' ? undefined : {});
        assert.equal(res.status, 403, `${route.method} ${route.path} for a ${role}`);
        checked++;
      }
    }
    assert.ok(catalog.routes.length > 0);
    void checked;
  });

  it('Given an authorisation failure, when it happens, then a security event records the user, endpoint and time without the IP in clear (L2-079.4, L2-084)', async () => {
    const operatorsOnly: Area = (r) => r.get('/api/probe/operators', roles('Operator'), async () => ({ status: 200, body: {} }));
    const api = await startApi({ areas: [...productAreas, operatorsOnly] });
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    const res = await marcia.get('/api/probe/operators');
    assert.equal(res.status, 403);
    const events = await documents(api, 'securityEvents');
    const denial = events.find((e) => e.type === 'authorization-failure');
    assert.equal(denial.userId, 'user-marcia');
    assert.equal(denial.path, '/api/probe/operators');
    assert.equal(denial.at, '2026-10-10T14:00:00.000Z');
    assert.equal(denial.correlationId, res.headers.get('x-correlation-id'));
    assert.match(denial.ipHash, /^[0-9a-f]{32}$/);
    assert.equal(JSON.stringify(events).includes('127.0.0.1'), false);
  });

  it('Given sign-ins, when they succeed or fail, then each is a security event', async () => {
    const api = await startApi();
    await api.client().post('/api/identity/sign-in', { email: 'andre.c@example.com', password: 'wrong-password-1' });
    await signedInClient(api, 'andre.c@example.com');
    const types = (await documents(api, 'securityEvents')).sort((a, b) => a.seq - b.seq).map((e) => [e.type, e.userId]);
    assert.deepEqual(types, [
      ['sign-in-failure', 'user-andre'],
      ['sign-in-success', 'user-andre'],
    ]);
  });
});
