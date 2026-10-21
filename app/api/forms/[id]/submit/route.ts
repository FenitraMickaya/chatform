import { createSubmission, getFormForOwner, getPublicForm } from '@/lib/forms.ts';
import { getCurrentUser } from '@/lib/auth.ts';
import { jsonError, jsonOk, readJson, resolveLanguage } from '@/lib/api.ts';
import { validateSubmission } from '@/lib/validation.ts';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

/**
 * Submits a response.
 *
 * Published forms accept public responses (embedded widget, public link).
 * Drafts only accept responses from their owner (the in-app tester).
 */
export async function POST(request: Request, { params }: Context) {
  const { id } = await params;

  const lang = resolveLanguage(request);
  let form = await getPublicForm(id, lang);
  if (!form) {
    const user = await getCurrentUser();
    if (!user) return jsonError('Form not found.', 404);
    const owned = await getFormForOwner(id, user.id, lang);
    if (!owned) return jsonError('Form not found.', 404);
    form = owned;
  }

  const body = await readJson(request);
  const parsed = validateSubmission(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const submission = await createSubmission(
    form.id,
    parsed.value.answers,
    parsed.value.completionTimeSeconds,
    request.headers.get('user-agent')
  );

  return jsonOk(submission, 201);
}
