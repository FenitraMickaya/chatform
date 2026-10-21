import { createForm, listFormsForOwner, updateForm } from '@/lib/forms.ts';
import { getCurrentUser } from '@/lib/auth.ts';
import { jsonError, jsonOk, readJson } from '@/lib/api.ts';
import { validateForm } from '@/lib/validation.ts';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);
  return jsonOk(await listFormsForOwner(user.id));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const body = await readJson(request);
  const parsed = validateForm(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const existing = await updateForm(user.id, parsed.value);
  if (existing) return jsonOk(existing);

  try {
    return jsonOk(await createForm(user.id, parsed.value), 201);
  } catch (err: any) {
    if (err?.code === '23505') {
      return jsonError('A form with this id already exists.', 409);
    }
    throw err;
  }
}
