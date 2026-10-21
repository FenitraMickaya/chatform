/**
 * Seeds the demo workspace: two accounts, three example forms and a set of
 * example submissions.
 *
 *   npm run db:seed
 *
 * The script is idempotent: already-seeded rows are left untouched.
 */

import { Client } from 'pg';
import { hashPassword } from '../lib/auth.ts';
import { INITIAL_FORMS, INITIAL_SUBMISSIONS } from '../src/data/seedData.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local first.');
  process.exit(1);
}

const DEMO_USER = {
  id: 'usr_demo_user',
  name: 'Demo',
  email: 'demo@formpulse.dev',
  password: 'demo1234',
  role: 'Utilisateur Démo',
  avatar: 'D',
  createdAt: '2026-10-15T08:00:00.000Z',
};

const OWNER_USER = {
  id: 'usr_user_owner',
  name: 'Demo',
  email: 'fenitramickaya45@gmail.com',
  password: 'password123',
  role: 'Form Creator',
  avatar: 'D',
  createdAt: '2026-10-19T08:00:00.000Z',
};

async function seedUser(client: Client, user: typeof DEMO_USER) {
  const existing = await client.query('SELECT id FROM users WHERE id = $1 OR email = $2', [
    user.id,
    user.email,
  ]);
  if (existing.rowCount && existing.rowCount > 0) {
    console.log(`[seed] User ${user.email} already exists.`);
    return;
  }
  await client.query(
    `INSERT INTO users (id, email, name, password_hash, role, avatar, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      user.id,
      user.email,
      user.name,
      hashPassword(user.password),
      user.role,
      user.avatar,
      user.createdAt,
    ]
  );
  console.log(`[seed] Created user ${user.email}.`);
}

const refresh = process.argv.includes('--refresh');

async function seedForm(client: Client, form: (typeof INITIAL_FORMS)[number], ownerId: string) {
  const existing = await client.query('SELECT id FROM forms WHERE id = $1', [form.id]);
  if (existing.rowCount && existing.rowCount > 0) {
    if (!refresh) {
      console.log(`[seed] Form ${form.id} already exists.`);
      return;
    }
    // Refresh: reset the demo form to its seed state (content + locales).
    await client.query('DELETE FROM questions WHERE form_id = $1', [form.id]);
    await client.query(
      `UPDATE forms
          SET title = $2, description = $3, theme = $4, locales = $5, default_lang = $6,
              updated_at = $7
        WHERE id = $1`,
      [
        form.id,
        form.title,
        form.description,
        JSON.stringify(form.theme),
        JSON.stringify(form.locales ?? {}),
        form.defaultLang ?? 'en',
        form.updatedAt,
      ]
    );
    await insertQuestions(client, form);
    console.log(`[seed] Refreshed form ${form.id}.`);
    return;
  }

  await client.query(
    `INSERT INTO forms
       (id, owner_id, title, description, status, theme, locales, default_lang, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      form.id,
      ownerId,
      form.title,
      form.description,
      form.status,
      JSON.stringify(form.theme),
      JSON.stringify(form.locales ?? {}),
      form.defaultLang ?? 'en',
      form.createdAt,
      form.updatedAt,
    ]
  );

  await insertQuestions(client, form);
  console.log(`[seed] Created form ${form.id} (${form.questions.length} questions).`);
}

async function insertQuestions(
  client: Client,
  form: (typeof INITIAL_FORMS)[number]
) {
  for (let i = 0; i < form.questions.length; i++) {
    const q = form.questions[i];
    // Per-language overrides for this question.
    const perLanguage: Record<string, unknown> = {};
    for (const [lang, override] of Object.entries(form.locales ?? {})) {
      const entry = override?.questions?.[q.id];
      if (entry) perLanguage[lang] = entry;
    }
    await client.query(
      `INSERT INTO questions
         (id, form_id, position, type, title, description, required, placeholder, options, min_rating, max_rating, locales)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        q.id,
        form.id,
        i,
        q.type,
        q.title,
        q.description ?? '',
        q.required ?? false,
        q.placeholder ?? '',
        q.options ? JSON.stringify(q.options) : null,
        q.minRating ?? null,
        q.maxRating ?? null,
        JSON.stringify(perLanguage),
      ]
    );
  }
}

async function seedSubmission(client: Client, sub: (typeof INITIAL_SUBMISSIONS)[number]) {
  const existing = await client.query('SELECT id FROM submissions WHERE id = $1', [sub.id]);
  if (existing.rowCount && existing.rowCount > 0) return;

  await client.query(
    `INSERT INTO submissions (id, form_id, answers, completion_time_seconds, user_agent, submitted_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      sub.id,
      sub.formId,
      JSON.stringify(sub.answers),
      sub.completionTimeSeconds ?? 0,
      sub.userAgent ?? null,
      sub.submittedAt,
    ]
  );
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await seedUser(client, DEMO_USER);
    await seedUser(client, OWNER_USER);

    for (const form of INITIAL_FORMS) {
      await seedForm(client, form, DEMO_USER.id);
    }

    let count = 0;
    for (const sub of INITIAL_SUBMISSIONS) {
      await seedSubmission(client, sub);
      count++;
    }
    console.log(`[seed] Seeded ${count} submissions.`);
    console.log('[seed] Done.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
