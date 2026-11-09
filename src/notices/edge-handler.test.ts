import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle } from './edge-handler';

const URL0 = 'https://db.example.supabase.co';
afterEach(() => vi.unstubAllGlobals());

function fakeFetch(writeOk: boolean) {
  const calls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (u: string, init?: RequestInit) => {
    calls.push(`${init?.method ?? 'GET'} ${u}`);
    if (u.includes('/rest/v1/official_notices?id=eq.-1')) return new Response(null, { status: writeOk ? 204 : 401 });
    if (u.includes('/rest/v1/official_notices')) return new Response(JSON.stringify([{ id: 1 }]), { status: 201 });
    return new Response('<table><tr><td><a href="/n.pdf">Civil Services Examination 2027 notification</a></td></tr></table>', { status: 200 });
  }));
  return calls;
}
const req = (body: unknown, key = 'sb_secret_x') => new Request('https://f/collect-notices', { method: 'POST', headers: { apikey: key }, body: JSON.stringify(body) });

describe('collect-notices function', () => {
  it('refuses callers whose key cannot write', async () => {
    const calls = fakeFetch(false);
    const res = await handle(req({ only: ['upsc'] }, 'sb_publishable_x'), URL0);
    expect(res.status).toBe(401);
    expect(calls).toEqual([`PATCH ${URL0}/rest/v1/official_notices?id=eq.-1`]);
  });
  it('reads the named sources and saves what it finds', async () => {
    fakeFetch(true);
    const res = await handle(req({ only: ['upsc', 'nope'] }), URL0);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.results).toMatchObject([{ id: 'upsc', ok: true, found: 1, fresh: 1 }]);
  });
  it('needs at least one known source', async () => {
    fakeFetch(true);
    expect((await handle(req({ only: [] }), URL0)).status).toBe(400);
  });
});
