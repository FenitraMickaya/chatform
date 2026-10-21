import {
  createSession,
  findUserByEmail,
  setSessionCookie,
  toPublicUser,
  verifyPassword,
} from '@/lib/auth.ts';
import { jsonError, jsonOk, readJson } from '@/lib/api.ts';
import { validateSignIn } from '@/lib/validation.ts';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = validateSignIn(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const account = await findUserByEmail(parsed.value.email);
  // Same message for an unknown email and a wrong password: no account enumeration.
  if (!account || !verifyPassword(parsed.value.password, account.password_hash)) {
    return jsonError('Incorrect email or password.', 401);
  }

  const token = await createSession(account.id);
  await setSessionCookie(token);

  return jsonOk({ user: toPublicUser(account) });
}
