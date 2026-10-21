/**
 * REST client for the Chatform API.
 *
 * The server is the single source of truth: nothing is cached in
 * localStorage anymore. Every mutating call is authenticated by the
 * httpOnly session cookie set by the API.
 *
 * Content is language aware: the current UI language travels with the
 * request (`?lang=`) so the API resolves the right version of a form.
 */

import type { Form, FormSubmission, FormStatus } from '../types/index.ts';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const LANGUAGE_KEY = 'chatform_language';

/** The language currently selected in the interface. */
export function currentLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === 'en' || saved === 'fr') return saved;
  // Migrate the key used before the rebrand.
  const legacy = localStorage.getItem('formpulse_language');
  if (legacy === 'en' || legacy === 'fr') {
    localStorage.setItem(LANGUAGE_KEY, legacy);
    localStorage.removeItem('formpulse_language');
    return legacy;
  }
  return 'fr';
}

function withLanguage(url: string): string {
  const lang = currentLanguage();
  if (!url.includes('lang=')) {
    return `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;
  }
  return url;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(withLanguage(url), {
      credentials: 'same-origin',
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      ...init,
    });
  } catch {
    throw new ApiError('Network error: the Chatform server is unreachable.', 0);
  }

  if (res.status === 204) return undefined as T;

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
    const message = payload?.error || `Request failed with status ${res.status}.`;
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

export const api = {
  /* ----------------------------- public ----------------------------- */

  /** Published forms, usable for the landing page demo. */
  getPublicForms(): Promise<Form[]> {
    return request<Form[]>('/api/public/forms');
  },

  /** A single published form (used by the standalone/embed view). */
  getPublicForm(id: string): Promise<Form> {
    return request<Form>(`/api/public/forms/${encodeURIComponent(id)}`);
  },

  /** Submit a response to a published form. Works without a session. */
  submitResponse(
    formId: string,
    answers: Record<string, string | number | string[]>,
    completionTimeSeconds?: number
  ): Promise<FormSubmission> {
    return request<FormSubmission>(`/api/forms/${encodeURIComponent(formId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answers,
        completionTimeSeconds: completionTimeSeconds ?? 0,
      }),
    });
  },

  /* ------------------------- authenticated -------------------------- */

  /** Forms owned by the signed-in user. */
  getForms(): Promise<Form[]> {
    return request<Form[]>('/api/forms');
  },

  getFormById(id: string): Promise<Form> {
    return request<Form>(`/api/forms/${encodeURIComponent(id)}`);
  },

  saveForm(form: Form): Promise<Form> {
    return request<Form>('/api/forms', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  },

  deleteForm(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/forms/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async togglePublish(id: string): Promise<Form | null> {
    const form = await api.getFormById(id);
    const newStatus: FormStatus = form.status === 'published' ? 'draft' : 'published';
    return api.saveForm({ ...form, status: newStatus });
  },

  getSubmissions(formId?: string): Promise<FormSubmission[]> {
    const url = formId
      ? `/api/forms/${encodeURIComponent(formId)}/responses`
      : '/api/responses';
    return request<FormSubmission[]>(url);
  },

  deleteSubmission(subId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/responses/${encodeURIComponent(subId)}`, {
      method: 'DELETE',
    });
  },
};
