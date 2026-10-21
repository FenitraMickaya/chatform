import { listSubmissionsForOwner } from '@/lib/forms.ts';
import { getCurrentUser } from '@/lib/auth.ts';
import { jsonError, jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

/** All the responses of the forms owned by the signed-in user. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);
  return jsonOk(await listSubmissionsForOwner(user.id));
}
