/**
 * Small helpers shared by the API route handlers.
 */

import { NextResponse } from 'next/server';

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Resolves the language of a request: an explicit `?lang=` wins, then the
 * `Accept-Language` header. Unknown values fall back to English.
 */
export function resolveLanguage(request: Request): string {
  const explicit = new URL(request.url).searchParams.get('lang');
  if (explicit && /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(explicit)) return explicit.toLowerCase();

  const header = request.headers.get('accept-language') || '';
  const first = header.split(',')[0]?.trim().toLowerCase() || '';
  if (/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(first)) return first;
  if (first.startsWith('fr')) return 'fr';
  if (first.startsWith('en')) return 'en';
  return 'en';
}

/** Parses a JSON body, returning null when the payload is not valid JSON. */
export async function readJson(request: Request): Promise<any | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
