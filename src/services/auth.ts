/**
 * Session management.
 *
 * The session lives in an httpOnly cookie owned by the server: this module
 * only talks to /api/auth/*. There is no user record, no password and no
 * token stored in the browser.
 */

import type { User } from '../types/index.ts';
import { ApiError } from './api.ts';

async function jsonRequest<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const text = await res.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(payload?.error || 'Authentication failed.', res.status);
  }
  return payload as T;
}

export const authService = {
  /** Returns the signed-in user, or null when there is no valid session. */
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      const data = await res.json();
      return (data?.user as User) ?? null;
    } catch {
      return null;
    }
  },

  async signIn(email: string, password: string): Promise<User> {
    const data = await jsonRequest<{ user: User }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data.user;
  },

  async signUp(name: string, email: string, password: string): Promise<User> {
    const data = await jsonRequest<{ user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return data.user;
  },

  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // Signing out locally must always succeed, even if the server is down.
    }
  },
};
