import { clearSessionCookie, destroySession } from '@/lib/auth.ts';
import { cookies } from 'next/headers';
import { jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

export async function POST() {
  const store = await cookies();
  const token = store.get('fp_session')?.value;
  if (token) await destroySession(token);
  await clearSessionCookie();
  return jsonOk({ success: true });
}
