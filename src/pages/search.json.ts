import type { APIRoute } from 'astro';
import { searchEntries } from '../lib/search';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchEntries()), {
    headers: { 'content-type': 'application/json' },
  });
