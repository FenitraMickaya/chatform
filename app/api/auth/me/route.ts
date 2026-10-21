import { getCurrentUser, toPublicUser } from '@/lib/auth.ts';
import { jsonError, jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Not authenticated.', 401);
  return jsonOk({ user: toPublicUser(user) });
}
