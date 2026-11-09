// Supabase Edge Function "collect-notices". Runs in Supabase's Mumbai region (the caller sends
// x-region: ap-south-1), so it can read government websites that refuse servers outside India.
// It holds no key of its own: the caller's secret key is checked against the database and then
// used for the inserts, so a caller without the secret key can do nothing.
import { NOTICE_SOURCES } from './sources';
import { canWrite, collectSource } from './collect';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function handle(req: Request, supabaseUrl: string): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const key = req.headers.get('apikey') || auth;
  if (!(await canWrite(supabaseUrl, key))) return json({ error: 'Secret key required' }, 401);
  const body = (await req.json().catch(() => ({}))) as { only?: string[] };
  const ids = (body.only ?? []).slice(0, 4); // a few sites per call keeps each call short
  const sources = NOTICE_SOURCES.filter((s) => ids.includes(s.id));
  if (!sources.length) return json({ error: 'Name 1 to 4 source ids in "only"' }, 400);
  const results = await Promise.all(sources.map((s) => collectSource(s, supabaseUrl, key)));
  return json({ region: (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env.get('SB_REGION') ?? null, results });
}
