/**
 * Dependency-free payload validation.
 *
 * Every write endpoint validates its input before touching the database.
 * Unknown fields are dropped, types are coerced when unambiguous, and
 * oversized payloads are rejected outright.
 */

export const QUESTION_TYPES = ['text', 'email', 'multiple_choice', 'yes_no', 'rating'] as const;
export const WIDGET_POSITIONS = ['bottom-right', 'bottom-left'] as const;
export const BOT_AVATARS = ['bot', 'sparkles', 'message', 'help', 'user', 'zap'] as const;

const MAX_STRING = 2000;
const MAX_TITLE = 200;
const MAX_QUESTIONS = 50;
const MAX_OPTIONS = 50;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export interface ValidatedQuestion {
  id: string;
  type: (typeof QUESTION_TYPES)[number];
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
  options?: string[];
  minRating?: number;
  maxRating?: number;
}

export interface ValidatedForm {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  theme: {
    primaryColor: string;
    accentColor: string;
    position: (typeof WIDGET_POSITIONS)[number];
    botName: string;
    botAvatar: (typeof BOT_AVATARS)[number];
    welcomeMessage: string;
    thankYouMessage: string;
    launcherText: string;
    showProgressBar: boolean;
  };
  questions: ValidatedQuestion[];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, max = MAX_STRING, fallback = ''): string {
  if (typeof v === 'string') return v.slice(0, max);
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return fallback;
}

function bool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

function hexColor(v: unknown, fallback: string): string {
  const raw = str(v, 32, fallback);
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

export function validateQuestion(input: unknown, index: number): ValidationResult<ValidatedQuestion> {
  if (!isPlainObject(input)) {
    return { ok: false, error: `Question ${index + 1} is malformed.` };
  }
  const type = oneOf(input.type, QUESTION_TYPES, 'text');
  const title = str(input.title, MAX_TITLE, '').trim();
  if (!title) {
    return { ok: false, error: `Question ${index + 1} is missing a title.` };
  }

  const question: ValidatedQuestion = {
    id: str(input.id, 80, `q_${Date.now()}_${index}`),
    type,
    title,
    description: str(input.description, MAX_STRING, ''),
    required: bool(input.required, false),
    placeholder: str(input.placeholder, 300, ''),
  };

  if (type === 'multiple_choice') {
    const options = Array.isArray(input.options)
      ? input.options.map((o) => str(o, 300, '').trim()).filter(Boolean).slice(0, MAX_OPTIONS)
      : [];
    if (options.length < 2) {
      return { ok: false, error: `Question ${index + 1} needs at least 2 options.` };
    }
    question.options = options;
  }

  if (type === 'rating') {
    const min = Number.isFinite(Number(input.minRating)) ? Number(input.minRating) : 1;
    const max = Number.isFinite(Number(input.maxRating)) ? Number(input.maxRating) : 5;
    const minRating = Math.min(Math.max(Math.trunc(min), 1), 10);
    question.minRating = minRating;
    question.maxRating = Math.min(Math.max(Math.trunc(max), minRating), 10);
  }

  return { ok: true, value: question };
}

export function validateForm(input: unknown): ValidationResult<ValidatedForm> {
  if (!isPlainObject(input)) {
    return { ok: false, error: 'Invalid form payload.' };
  }

  const id = str(input.id, 80, '').trim();
  if (!id) {
    return { ok: false, error: 'Form id is required.' };
  }

  const title = str(input.title, MAX_TITLE, '').trim();
  if (!title) {
    return { ok: false, error: 'Form title is required.' };
  }

  const rawQuestions = Array.isArray(input.questions) ? input.questions : [];
  if (rawQuestions.length === 0) {
    return { ok: false, error: 'A form needs at least one question.' };
  }
  if (rawQuestions.length > MAX_QUESTIONS) {
    return { ok: false, error: `A form cannot exceed ${MAX_QUESTIONS} questions.` };
  }

  const questions: ValidatedQuestion[] = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const result = validateQuestion(rawQuestions[i], i);
    if (!result.ok) return result;
    questions.push(result.value);
  }

  const rawTheme = isPlainObject(input.theme) ? input.theme : {};
  const theme = {
    primaryColor: hexColor(rawTheme.primaryColor, '#4F46E5'),
    accentColor: hexColor(rawTheme.accentColor, '#EEF2FF'),
    position: oneOf(rawTheme.position, WIDGET_POSITIONS, 'bottom-right'),
    botName: str(rawTheme.botName, 60, 'Assistant'),
    botAvatar: oneOf(rawTheme.botAvatar, BOT_AVATARS, 'bot'),
    welcomeMessage: str(rawTheme.welcomeMessage, MAX_STRING, 'Hello! Welcome.'),
    thankYouMessage: str(rawTheme.thankYouMessage, MAX_STRING, 'Thank you! Your response was recorded.'),
    launcherText: str(rawTheme.launcherText, 60, 'Chat with Us'),
    showProgressBar: bool(rawTheme.showProgressBar, true),
  };

  return {
    ok: true,
    value: {
      id,
      title,
      description: str(input.description, MAX_STRING, ''),
      status: input.status === 'published' ? 'published' : 'draft',
      questions,
      theme,
    },
  };
}

export function validateSubmission(input: unknown): ValidationResult<{
  answers: Record<string, string | number | string[]>;
  completionTimeSeconds: number;
}> {
  if (!isPlainObject(input)) {
    return { ok: false, error: 'Invalid submission payload.' };
  }
  if (!isPlainObject(input.answers)) {
    return { ok: false, error: 'Missing answers.' };
  }

  const answers: Record<string, string | number | string[]> = {};
  for (const [key, value] of Object.entries(input.answers)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      answers[str(key, 80, '')] = value;
    } else if (typeof value === 'string') {
      answers[str(key, 80, '')] = value.slice(0, MAX_STRING);
    } else if (Array.isArray(value)) {
      answers[str(key, 80, '')] = value.slice(0, 50).map((v) => str(v, 500, ''));
    } else {
      return { ok: false, error: `Unsupported answer type for question "${key}".` };
    }
  }

  const completionTimeSeconds = Number.isFinite(Number(input.completionTimeSeconds))
    ? Math.min(Math.max(Math.trunc(Number(input.completionTimeSeconds)), 0), 86400)
    : 0;

  return { ok: true, value: { answers, completionTimeSeconds } };
}

export function validateSignUp(
  input: unknown
): ValidationResult<{ name: string; email: string; password: string }> {
  if (!isPlainObject(input)) return { ok: false, error: 'Invalid payload.' };
  const name = str(input.name, 80, '').trim();
  const email = str(input.email, 200, '').trim().toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';

  if (!name) return { ok: false, error: 'Name is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'A valid email address is required.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters long.' };
  }
  if (password.length > 200) {
    return { ok: false, error: 'Password is too long.' };
  }
  return { ok: true, value: { name, email, password } };
}

export function validateSignIn(
  input: unknown
): ValidationResult<{ email: string; password: string }> {
  if (!isPlainObject(input)) return { ok: false, error: 'Invalid payload.' };
  const email = str(input.email, 200, '').trim().toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }
  return { ok: true, value: { email, password } };
}
