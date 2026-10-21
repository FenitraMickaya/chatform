/**
 * Data access layer for forms, questions and submissions.
 *
 * Forms own their questions (ordered) and their submissions. Response counts
 * are always derived from the submissions table — never stored twice.
 *
 * Content localisation: a form stores its default-language content in the
 * columns, plus a `locales` map of per-language overrides. Reads resolve the
 * content for the requested language; writes keep the default content and the
 * overrides in sync.
 */

import { query, queryOne, withTransaction } from './db.ts';
import type { ValidatedForm, ValidatedQuestion } from './validation.ts';
import type {
  Form,
  FormLocales,
  FormQuestion,
  FormSubmission,
  FormTheme,
} from '../src/types/index.ts';

interface FormRow {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  theme: Partial<FormTheme> | null;
  locales: FormLocales | null;
  default_lang: string;
  created_at: string;
  updated_at: string;
  response_count?: string | number;
}

interface QuestionRow {
  id: string;
  form_id: string;
  position: number;
  type: FormQuestion['type'];
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
  options: string[] | null;
  min_rating: number | null;
  max_rating: number | null;
  locales: Record<string, { title?: string; description?: string }> | null;
}

interface SubmissionRow {
  id: string;
  form_id: string;
  answers: Record<string, string | number | string[]>;
  completion_time_seconds: number;
  user_agent: string | null;
  submitted_at: string;
}

const DEFAULT_THEME: FormTheme = {
  primaryColor: '#4F46E5',
  accentColor: '#EEF2FF',
  position: 'bottom-right',
  botName: 'Assistant',
  botAvatar: 'bot',
  welcomeMessage: 'Hello! Welcome to our interactive assistant.',
  thankYouMessage: 'Thank you! Your response is recorded.',
  launcherText: 'Chat with Us',
  showProgressBar: true,
};

function mapSubmission(row: SubmissionRow): FormSubmission {
  return {
    id: row.id,
    formId: row.form_id,
    submittedAt: new Date(row.submitted_at).toISOString(),
    answers: row.answers ?? {},
    completionTimeSeconds: row.completion_time_seconds,
    userAgent: row.user_agent ?? undefined,
  };
}

const THEME_LOCALIZABLE_KEYS: (keyof FormTheme)[] = [
  'botName',
  'welcomeMessage',
  'thankYouMessage',
  'launcherText',
];

function mapQuestion(row: QuestionRow, lang: string): FormQuestion {
  const override = row.locales?.[lang];
  const question: FormQuestion = {
    id: row.id,
    type: row.type,
    title: override?.title ?? row.title,
    description: override?.description ?? row.description,
    required: row.required,
    placeholder: row.placeholder,
  };
  if (row.options) question.options = row.options;
  if (row.min_rating != null) question.minRating = row.min_rating;
  if (row.max_rating != null) question.maxRating = row.max_rating;
  return question;
}

function mapTheme(row: FormRow, lang: string): FormTheme {
  const base = { ...DEFAULT_THEME, ...(row.theme ?? {}) };
  const override = row.locales?.[lang]?.theme;
  if (!override) return base;
  const merged: FormTheme = { ...base };
  for (const key of THEME_LOCALIZABLE_KEYS) {
    const value = override[key];
    if (typeof value === 'string' && value.length > 0) {
      (merged as any)[key] = value;
    }
  }
  return merged;
}

function mapForm(row: FormRow, questions: FormQuestion[], lang: string): Form {
  const override = row.locales?.[lang];
  return {
    id: row.id,
    title: override?.title ?? row.title,
    description: override?.description ?? row.description,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    questions,
    theme: mapTheme(row, lang),
    responseCount: Number(row.response_count ?? 0),
    defaultLang: row.default_lang || 'en',
    locales: row.locales ?? {},
  };
}

const FORM_SELECT = `
  SELECT f.*,
         (SELECT COUNT(*) FROM submissions s WHERE s.form_id = f.id) AS response_count
    FROM forms f`;

async function loadQuestions(
  formIds: string[],
  lang: string
): Promise<Map<string, FormQuestion[]>> {
  const map = new Map<string, FormQuestion[]>();
  if (formIds.length === 0) return map;
  const rows = await query<QuestionRow>(
    `SELECT * FROM questions WHERE form_id = ANY($1::text[]) ORDER BY form_id, position ASC`,
    [formIds]
  );
  for (const row of rows) {
    const list = map.get(row.form_id) ?? [];
    list.push(mapQuestion(row, lang));
    map.set(row.form_id, list);
  }
  return map;
}

export async function listFormsForOwner(ownerId: string, lang = 'en'): Promise<Form[]> {
  const rows = await query<FormRow>(
    `${FORM_SELECT} WHERE f.owner_id = $1 ORDER BY f.updated_at DESC`,
    [ownerId]
  );
  const questions = await loadQuestions(rows.map((r) => r.id), lang);
  return rows.map((row) => mapForm(row, questions.get(row.id) ?? [], lang));
}

export async function getFormForOwner(
  formId: string,
  ownerId: string,
  lang = 'en'
): Promise<Form | null> {
  const row = await queryOne<FormRow>(`${FORM_SELECT} WHERE f.id = $1 AND f.owner_id = $2`, [
    formId,
    ownerId,
  ]);
  if (!row) return null;
  const questions = await loadQuestions([row.id], lang);
  return mapForm(row, questions.get(row.id) ?? [], lang);
}

/** Published form, without any owner information. */
export async function getPublicForm(formId: string, lang = 'en'): Promise<Form | null> {
  const row = await queryOne<FormRow>(
    `${FORM_SELECT} WHERE f.id = $1 AND f.status = 'published'`,
    [formId]
  );
  if (!row) return null;
  const questions = await loadQuestions([row.id], lang);
  return mapForm(row, questions.get(row.id) ?? [], lang);
}

export async function listPublicForms(lang = 'en'): Promise<Form[]> {
  const rows = await query<FormRow>(
    `${FORM_SELECT} WHERE f.status = 'published' ORDER BY f.updated_at DESC LIMIT 50`
  );
  const questions = await loadQuestions(rows.map((r) => r.id), lang);
  return rows.map((row) => mapForm(row, questions.get(row.id) ?? [], lang));
}

async function insertQuestions(
  client: any,
  formId: string,
  questions: ValidatedQuestion[],
  locales: FormLocales
) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    // Question-level overrides live under the form locale map.
    const questionLocales: Record<string, { title?: string; description?: string }> = {};
    for (const [lang, override] of Object.entries(locales)) {
      const entry = override?.questions?.[q.id];
      if (entry && (entry.title || entry.description)) {
        questionLocales[lang] = entry;
      }
    }
    await client.query(
      `INSERT INTO questions
         (id, form_id, position, type, title, description, required, placeholder, options, min_rating, max_rating, locales)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        q.id,
        formId,
        i,
        q.type,
        q.title,
        q.description,
        q.required,
        q.placeholder,
        q.options ? JSON.stringify(q.options) : null,
        q.minRating ?? null,
        q.maxRating ?? null,
        JSON.stringify(questionLocales),
      ]
    );
  }
}

/**
 * Splits the incoming payload into the default-language content (columns) and
 * the per-language overrides (JSONB).
 *
 * `requestLang` is the language the client was working in. When it matches the
 * default language, the payload content *is* the default content. Otherwise
 * the default content comes from the `locales[defaultLang]` bucket, so editing
 * a translation never overwrites the original wording.
 */
function splitContent(
  form: ValidatedForm,
  defaultLang: string,
  requestLang: string,
  current?: { title: string; description: string; theme: Partial<FormTheme> }
) {
  const locales = { ...(form.locales ?? {}) };
  const defaultOverride = locales[defaultLang];
  const isDefaultLang = requestLang === defaultLang;

  const baseTitle =
    (isDefaultLang ? form.title.trim() : '') ||
    defaultOverride?.title?.trim() ||
    current?.title ||
    form.title;
  const baseDescription =
    (isDefaultLang ? form.description : '') ||
    defaultOverride?.description ||
    current?.description ||
    form.description;
  const baseTheme = isDefaultLang
    ? { ...form.theme, ...(defaultOverride?.theme ?? {}) }
    : { ...(current?.theme ?? {}), ...(defaultOverride?.theme ?? {}), ...form.theme };

  const questionLocales: Record<string, { title?: string; description?: string }> = {};
  for (const override of Object.values(locales)) {
    if (!override?.questions) continue;
    for (const [qid, entry] of Object.entries(override.questions)) {
      if (!entry) continue;
      questionLocales[qid] = { ...(questionLocales[qid] ?? {}), ...entry };
    }
  }

  // Invariant: the default language is always mirrored in the locale map, so
  // the default content can be restored from it without guessing.
  locales[defaultLang] = {
    ...(locales[defaultLang] ?? {}),
    title: baseTitle,
    description: baseDescription,
    theme: {
      botName: baseTheme.botName,
      welcomeMessage: baseTheme.welcomeMessage,
      thankYouMessage: baseTheme.thankYouMessage,
      launcherText: baseTheme.launcherText,
    },
    questions: {
      ...(locales[defaultLang]?.questions ?? {}),
      ...Object.fromEntries(
        form.questions.map((q) => [
          q.id,
          { title: q.title, description: q.description },
        ])
      ),
    },
  };

  return { locales, baseTitle, baseDescription, baseTheme, questionLocales };
}

export async function createForm(
  ownerId: string,
  form: ValidatedForm,
  defaultLang = 'en',
  requestLang = defaultLang
): Promise<Form> {
  const { locales, baseTitle, baseDescription, baseTheme } = splitContent(
    form,
    defaultLang,
    requestLang
  );
  return withTransaction(async (client) => {
    await client.query(
      `INSERT INTO forms (id, owner_id, title, description, status, theme, locales, default_lang)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        form.id,
        ownerId,
        baseTitle,
        baseDescription,
        form.status,
        JSON.stringify(baseTheme),
        JSON.stringify(locales),
        defaultLang,
      ]
    );
    await insertQuestions(client, form.id, form.questions, locales);
    const created = await client.query<FormRow>(`${FORM_SELECT} WHERE f.id = $1`, [form.id]);
    return mapForm(created.rows[0], form.questions as FormQuestion[], defaultLang);
  });
}

export async function updateForm(
  ownerId: string,
  form: ValidatedForm,
  defaultLang = 'en',
  requestLang = defaultLang
): Promise<Form | null> {
  return withTransaction(async (client) => {
    const existing = await client.query<FormRow>(
      `SELECT * FROM forms WHERE id = $1 AND owner_id = $2 FOR UPDATE`,
      [form.id, ownerId]
    );
    if (existing.rowCount === 0) return null;

    const current = existing.rows[0];
    const { locales, baseTitle, baseDescription, baseTheme, questionLocales } = splitContent(
      form,
      defaultLang,
      requestLang,
      {
        title: current.title,
        description: current.description,
        theme: current.theme ?? {},
      }
    );

    await client.query(
      `UPDATE forms
          SET title = $3, description = $4, status = $5, theme = $6, locales = $7,
              default_lang = $8, updated_at = NOW()
        WHERE id = $1 AND owner_id = $2`,
      [
        form.id,
        ownerId,
        baseTitle,
        baseDescription,
        form.status,
        JSON.stringify(baseTheme),
        JSON.stringify(locales),
        defaultLang,
      ]
    );
    await client.query('DELETE FROM questions WHERE form_id = $1', [form.id]);
    await insertQuestions(client, form.id, form.questions, locales);

    // Keep the question-level overrides in sync with the form locale map.
    for (const [qid, entry] of Object.entries(questionLocales)) {
      await client.query('UPDATE questions SET locales = $3 WHERE id = $1 AND form_id = $2', [
        qid,
        form.id,
        JSON.stringify(entry),
      ]);
    }

    const updated = await client.query<FormRow>(`${FORM_SELECT} WHERE f.id = $1`, [form.id]);
    return mapForm(updated.rows[0], form.questions as FormQuestion[], defaultLang);
  });
}

export async function deleteForm(ownerId: string, formId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM forms WHERE id = $1 AND owner_id = $2 RETURNING id',
    [formId, ownerId]
  );
  return result.length > 0;
}

export async function listSubmissions(formId: string): Promise<FormSubmission[]> {
  const rows = await query<SubmissionRow>(
    `SELECT * FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC`,
    [formId]
  );
  return rows.map(mapSubmission);
}

export async function listSubmissionsForOwner(ownerId: string): Promise<FormSubmission[]> {
  const rows = await query<SubmissionRow>(
    `SELECT s.* FROM submissions s
       JOIN forms f ON f.id = s.form_id
      WHERE f.owner_id = $1
      ORDER BY s.submitted_at DESC`,
    [ownerId]
  );
  return rows.map(mapSubmission);
}

export async function createSubmission(
  formId: string,
  answers: Record<string, string | number | string[]>,
  completionTimeSeconds: number,
  userAgent: string | null
): Promise<FormSubmission> {
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const rows = await query<SubmissionRow>(
    `INSERT INTO submissions (id, form_id, answers, completion_time_seconds, user_agent)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, formId, JSON.stringify(answers), completionTimeSeconds, userAgent]
  );
  return mapSubmission(rows[0]);
}

export async function deleteSubmission(ownerId: string, submissionId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM submissions s
      USING forms f
      WHERE s.id = $1 AND s.form_id = f.id AND f.owner_id = $2
      RETURNING s.id`,
    [submissionId, ownerId]
  );
  return rows.length > 0;
}
