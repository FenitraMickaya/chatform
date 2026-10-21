import { getPublicForm } from '@/lib/forms.ts';
import { jsonError, jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const form = await getPublicForm(id);
  if (!form) return jsonError('Form not found.', 404);
  return jsonOk(form);
}
