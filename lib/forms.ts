/**
 * Data access layer for forms, questions and submissions.
 *
 * Forms own their questions (ordered) and their submissions. Response counts
 * are always derived from the submissions table — never stored twice.
 */

import { query, queryOne, withTransaction } from './db.ts';
import type { ValidatedForm, ValidatedQuestion } from './validation.ts';
import type { Form, FormQuestion, FormSubmission, FormTheme } from '../src/types/index.ts';

interface FormRow {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  theme: Partial<FormTheme> | null;
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

function mapQuestion(row: QuestionRow): FormQuestion {
  const question: FormQuestion = {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    required: row.required,
    placeholder: row.placeholder,
  };
  if (row.options) question.options = row.options;
  if (row.min_rating != null) question.minRating = row.min_rating;
  if (row.max_rating != null) question.maxRating = row.max_rating;
  return question;
}

function mapForm(row: FormRow, questions: FormQuestion[]): Form {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    questions,
    theme: { ...DEFAULT_THEME, ...(row.theme ?? {}) },
    responseCount: Number(row.response_count ?? 0),
  };
}

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

const FORM_SELECT = `
  SELECT f.*,
         (SELECT COUNT(*) FROM submissions s WHERE s.form_id = f.id) AS response_count
    FROM forms f`;

async function loadQuestions(formIds: string[]): Promise<Map<string, FormQuestion[]>> {
  const map = new Map<string, FormQuestion[]>();
  if (formIds.length === 0) return map;
  const rows = await query<QuestionRow>(
    `SELECT * FROM questions WHERE form_id = ANY($1::text[]) ORDER BY form_id, position ASC`,
    [formIds]
  );
  for (const row of rows) {
    const list = map.get(row.form_id) ?? [];
    list.push(mapQuestion(row));
    map.set(row.form_id, list);
  }
  return map;
}

export async function listFormsForOwner(ownerId: string): Promise<Form[]> {
  const rows = await query<FormRow>(
    `${FORM_SELECT} WHERE f.owner_id = $1 ORDER BY f.updated_at DESC`,
    [ownerId]
  );
  const questions = await loadQuestions(rows.map((r) => r.id));
  return rows.map((row) => mapForm(row, questions.get(row.id) ?? []));
}

export async function getFormForOwner(formId: string, ownerId: string): Promise<Form | null> {
  const row = await queryOne<FormRow>(`${FORM_SELECT} WHERE f.id = $1 AND f.owner_id = $2`, [
    formId,
    ownerId,
  ]);
  if (!row) return null;
  const questions = await loadQuestions([row.id]);
  return mapForm(row, questions.get(row.id) ?? []);
}

/** Published form, without any owner information. */
export async function getPublicForm(formId: string): Promise<Form | null> {
  const row = await queryOne<FormRow>(
    `${FORM_SELECT} WHERE f.id = $1 AND f.status = 'published'`,
    [formId]
  );
  if (!row) return null;
  const questions = await loadQuestions([row.id]);
  return mapForm(row, questions.get(row.id) ?? []);
}

export async function listPublicForms(): Promise<Form[]> {
  const rows = await query<FormRow>(
    `${FORM_SELECT} WHERE f.status = 'published' ORDER BY f.updated_at DESC LIMIT 50`
  );
  const questions = await loadQuestions(rows.map((r) => r.id));
  return rows.map((row) => mapForm(row, questions.get(row.id) ?? []));
}

async function insertQuestions(client: any, formId: string, questions: ValidatedQuestion[]) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await client.query(
      `INSERT INTO questions
         (id, form_id, position, type, title, description, required, placeholder, options, min_rating, max_rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
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
      ]
    );
  }
}

export async function createForm(ownerId: string, form: ValidatedForm): Promise<Form> {
  return withTransaction(async (client) => {
    await client.query(
      `INSERT INTO forms (id, owner_id, title, description, status, theme)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        form.id,
        ownerId,
        form.title,
        form.description,
        form.status,
        JSON.stringify(form.theme),
      ]
    );
    await insertQuestions(client, form.id, form.questions);
    const created = await client.query<FormRow>(`${FORM_SELECT} WHERE f.id = $1`, [form.id]);
    return mapForm(created.rows[0], form.questions as FormQuestion[]);
  });
}

export async function updateForm(ownerId: string, form: ValidatedForm): Promise<Form | null> {
  return withTransaction(async (client) => {
    const existing = await client.query(
      `SELECT id FROM forms WHERE id = $1 AND owner_id = $2 FOR UPDATE`,
      [form.id, ownerId]
    );
    if (existing.rowCount === 0) return null;

    await client.query(
      `UPDATE forms
          SET title = $3, description = $4, status = $5, theme = $6, updated_at = NOW()
        WHERE id = $1 AND owner_id = $2`,
      [
        form.id,
        ownerId,
        form.title,
        form.description,
        form.status,
        JSON.stringify(form.theme),
      ]
    );
    await client.query('DELETE FROM questions WHERE form_id = $1', [form.id]);
    await insertQuestions(client, form.id, form.questions);

    const updated = await client.query<FormRow>(`${FORM_SELECT} WHERE f.id = $1`, [form.id]);
    return mapForm(updated.rows[0], form.questions as FormQuestion[]);
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
