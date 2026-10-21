import { deleteSubmission, listSubmissionsForOwner } from '@/lib/forms.ts';
import { getCurrentUser } from '@/lib/auth.ts';
import { jsonError, jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);
  return jsonOk(await listSubmissionsForOwner(user.id));
}

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const { id } = await params;
  const deleted = await deleteSubmission(user.id, id);
  if (!deleted) return jsonError('Submission not found.', 404);
  return jsonOk({ success: true });
}
