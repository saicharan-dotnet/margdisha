// Entry for the Supabase Edge Function. Built into supabase/functions/collect-notices/index.ts by `npm run fn:build`.
// Deploy: GitHub Actions workflow "Deploy Supabase function" (or paste that built file into the Supabase dashboard).
import { handle } from './edge-handler';

declare const Deno: { serve(h: (r: Request) => Promise<Response>): void; env: { get(k: string): string | undefined } };
Deno.serve((req) => handle(req, Deno.env.get('SUPABASE_URL')!));
