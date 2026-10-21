/**
 * Server-side authentication helpers.
 *
 * - Passwords: scrypt (node:crypto) with a random per-user salt.
 * - Sessions: opaque random tokens stored in PostgreSQL; the browser only
 *   ever holds an httpOnly cookie, so a stolen client cannot forge a session.
 */

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query, queryOne } from './db.ts';

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE = 'chatform_session';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string | null;
  avatar: string | null;
  created_at: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expected] = parts;
  let derived: string;
  try {
    derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  } catch {
    return false;
  }
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? undefined,
    avatar: user.avatar ?? undefined,
    createdAt: user.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  return queryOne<StoredUser>('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  return queryOne<StoredUser>('SELECT * FROM users WHERE id = $1', [id]);
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<StoredUser> {
  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const rows = await query<StoredUser>(
    `INSERT INTO users (id, email, name, password_hash, role, avatar)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      email.trim().toLowerCase(),
      name.trim() || 'New User',
      hashPassword(password),
      'Form Creator',
      (name.trim() || 'NU').slice(0, 2).toUpperCase(),
    ]
  );
  return rows[0];
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await query('INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)', [
    token,
    userId,
    expiresAt.toISOString(),
  ]);
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
}

export async function purgeExpiredSessions(): Promise<void> {
  await query('DELETE FROM sessions WHERE expires_at < NOW()');
}

/** Reads the session cookie and resolves the signed-in user, if any. */
export async function getCurrentUser(): Promise<StoredUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await queryOne<StoredUser & { expires_at: string }>(
    `SELECT u.*, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token = $1`,
    [token]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }
  return row;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
