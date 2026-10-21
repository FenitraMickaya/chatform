import { createUser, createSession, findUserByEmail, setSessionCookie, toPublicUser } from '@/lib/auth.ts';
import { jsonError, jsonOk, readJson } from '@/lib/api.ts';
import { validateSignUp } from '@/lib/validation.ts';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = validateSignUp(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  if (await findUserByEmail(parsed.value.email)) {
    return jsonError('An account with this email already exists.', 409);
  }

  const user = await createUser(parsed.value.name, parsed.value.email, parsed.value.password);
  const token = await createSession(user.id);
  await setSessionCookie(token);

  return jsonOk({ user: toPublicUser(user) }, 201);
}
