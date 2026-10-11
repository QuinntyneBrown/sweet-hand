import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { Controller, Get, Post } from '@nestjs/common';
import { anonymous, roles, type Reply, type Request } from '../../src/http/router.ts';
import { Ctx, UsePolicy } from '../../src/http/nest/decorators.ts';
import { productControllers } from '../../src/product.ts';

/** Routes that exist only in this test, to exercise the pipeline itself. */
@Controller('api/probe')
class ProbeController {
  @Get('public')
  @UsePolicy(anonymous)
  async public(): Promise<Reply> {
    return { status: 200, body: { ok: true } };
  }

  @Post('echo')
  @UsePolicy(anonymous)
  async echo(@Ctx() req: Request): Promise<Reply> {
    return { status: 200, body: req.body };
  }

  @Get('customers')
  @UsePolicy(roles('Customer'))
  async customers(): Promise<Reply> {
    return { status: 200, body: {} };
  }

  @Get('undeclared')
  async undeclared(): Promise<Reply> {
    return { status: 200, body: { leaked: true } };
  }

  @Get('boom')
  @UsePolicy(anonymous)
  async boom(): Promise<Reply> {
    throw new Error('kaboom: internal detail');
  }
}

describe('request pipeline (L2-079, L2-080, L2-081, L2-089)', async () => {
  const api = await startApi({ controllers: [...productControllers, ProbeController] });

  it('Given an endpoint that declares no policy, when anyone calls it, then it is refused (authentication by default)', async () => {
    const res = await api.client().get('/api/probe/undeclared');
    assert.equal(res.status, 403);
    assert.equal(JSON.stringify(res.body).includes('leaked'), false);
  });

  it('Given any request, when it is answered, then it carries a correlation ID and the security headers', async () => {
    const res = await api.client().get('/api/probe/public');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('x-correlation-id') ?? '', /^[0-9a-f-]{36}$/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.match(res.headers.get('permissions-policy') ?? '', /camera=\(\).*microphone=\(\).*geolocation=\(\)/);
    assert.match(res.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  });

  it('Given a first request, when it is answered, then it sets the XSRF-TOKEN cookie readable by scripts', async () => {
    const res = await fetch(`${api.url}/api/probe/public`);
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('XSRF-TOKEN='));
    assert.ok(cookie);
    assert.doesNotMatch(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/);
  });

  it('Given a POST without a matching CSRF token, when it is received, then it is rejected with 403 (L2-081.4)', async () => {
    const res = await fetch(`${api.url}/api/probe/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'XSRF-TOKEN=a' },
      body: '{}',
    });
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('content-type'), 'application/problem+json');
  });

  it('Given an unknown path, when it is requested, then the answer is a 404 problem', async () => {
    const res = await api.client().get('/api/nothing-here');
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { title: 'Not found' });
  });

  it('Given a JSON body over 1 MB, when it is posted, then it is rejected with 413 (L2-080.3)', async () => {
    const res = await api.client().post('/api/probe/echo', { text: 'x'.repeat(1024 * 1024 + 1) });
    assert.equal(res.status, 413);
  });

  it('Given malformed JSON, when it is posted, then it is rejected with 400', async () => {
    const res = await api.client().request('POST', '/api/probe/echo', '{"a":', { 'content-type': 'application/json' });
    assert.equal(res.status, 400);
  });

  it('Given text with control characters, when it is posted, then they are removed except tab and newline (L2-080.4)', async () => {
    const res = await api.client().post('/api/probe/echo', { name: 'Pelau\u0000 House\u0007', notes: ['line\none\ttab\u001b'] });
    assert.deepEqual(res.body, { name: 'Pelau House', notes: ['line\none\ttab'] });
  });

  it('Given a protected endpoint, when a visitor calls it, then the answer is 401', async () => {
    const res = await api.client().get('/api/probe/customers');
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { title: 'Sign in to continue' });
  });

  it('Given an unhandled exception, when it happens, then the caller gets a generic 500 with the correlation ID and no internals (L2-089.4)', async () => {
    const res = await api.client().get('/api/probe/boom');
    assert.equal(res.status, 500);
    assert.equal(res.body.title, 'Something went wrong');
    assert.equal(res.body.correlationId, res.headers.get('x-correlation-id'));
    assert.doesNotMatch(JSON.stringify(res.body), /kaboom/);
  });
});
