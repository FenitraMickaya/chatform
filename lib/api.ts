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

/** Parses a JSON body, returning null when the payload is not valid JSON. */
export async function readJson(request: Request): Promise<any | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
