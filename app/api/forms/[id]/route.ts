import { deleteForm, getFormForOwner } from '@/lib/forms.ts';
import { getCurrentUser } from '@/lib/auth.ts';
import { jsonError, jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const { id } = await params;
  const form = await getFormForOwner(id, user.id);
  if (!form) return jsonError('Form not found.', 404);
  return jsonOk(form);
}

export async function DELETE(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const { id } = await params;
  const deleted = await deleteForm(user.id, id);
  if (!deleted) return jsonError('Form not found.', 404);
  return jsonOk({ success: true });
}
