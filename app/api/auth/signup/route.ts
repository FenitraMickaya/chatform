import {
  countUsers,
  createSession,
  createUser,
  findUserByEmail,
  setSessionCookie,
  toPublicUser,
} from '@/lib/auth.ts';
import { jsonError, jsonOk, readJson, resolveLanguage } from '@/lib/api.ts';
import { validateSignUp } from '@/lib/validation.ts';

export const runtime = 'nodejs';

/** Default display name for an account created without one. */
function defaultDisplayName(lang: string, index: number): string {
  return lang.startsWith('fr') ? `Utilisateur n°${index}` : `User #${index}`;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = validateSignUp(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  if (await findUserByEmail(parsed.value.email)) {
    return jsonError('An account with this email already exists.', 409);
  }

  const lang = resolveLanguage(request);
  const name = parsed.value.name || defaultDisplayName(lang, (await countUsers()) + 1);

  const user = await createUser(name, parsed.value.email, parsed.value.password);
  const token = await createSession(user.id);
  await setSessionCookie(token);

  return jsonOk({ user: toPublicUser(user) }, 201);
}
