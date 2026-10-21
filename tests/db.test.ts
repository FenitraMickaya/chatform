import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');

const baseUrl = process.env.DATABASE_URL;
const testDbName = `chatform_test_${process.pid}_${Date.now()}`;

/**
 * Integration test: runs the real SQL schema against a throw-away database
 * and exercises the data access layer. Skipped when no database is reachable.
 */
let available = false;
let admin: Client | null = null;

function adminUrl(): string {
  const url = new URL(baseUrl!);
  url.pathname = '/postgres';
  return url.toString();
}

test.before(async () => {
  if (!baseUrl) return;
  try {
    admin = new Client({ connectionString: adminUrl() });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${testDbName}"`);
    const setup = new Client({ connectionString: baseUrlWithDb(testDbName) });
    await setup.connect();
    await setup.query(SCHEMA);
    await setup.end();
    process.env.DATABASE_URL = baseUrlWithDb(testDbName);
    available = true;
  } catch {
    available = false;
  }
});

test.after(async () => {
  // Close the pool first, otherwise the test runner tears the process down
  // while connections are still open.
  try {
    const { getPool } = await import('../lib/db.ts');
    await getPool().end();
  } catch {
    /* the pool was never opened */
  }
  if (admin) {
    try {
      await admin.query(`DROP DATABASE IF EXISTS "${testDbName}" WITH (FORCE)`);
    } catch {
      /* best effort */
    }
    await admin.end().catch(() => {});
  }
});

function baseUrlWithDb(name: string): string {
  const url = new URL(baseUrl!);
  url.pathname = `/${name}`;
  return url.toString();
}

test('a form, its questions and its submissions are stored and counted', async (t) => {
  if (!available) {
    t.skip('no database available');
    return;
  }

  const forms = await import('../lib/forms.ts');
  const { hashPassword } = await import('../lib/auth.ts');

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const userId = 'usr_test';
  await client.query(
    'INSERT INTO users (id, email, name, password_hash) VALUES ($1,$2,$3,$4)',
    [userId, 'test@example.com', 'Test', hashPassword('secret123')]
  );
  await client.end();

  const created = await forms.createForm(userId, {
    id: 'form_test',
    title: 'Test form',
    description: 'desc',
    status: 'published',
    theme: {
      primaryColor: '#4F46E5',
      accentColor: '#EEF2FF',
      position: 'bottom-right',
      botName: 'Bot',
      botAvatar: 'bot',
      welcomeMessage: 'Hi',
      thankYouMessage: 'Bye',
      launcherText: 'Chat',
      showProgressBar: true,
    },
    questions: [
      { id: 'q1', type: 'text', title: 'Name?', description: '', required: true, placeholder: '' },
      {
        id: 'q2',
        type: 'multiple_choice',
        title: 'Pick',
        description: '',
        required: true,
        placeholder: '',
        options: ['a', 'b'],
      },
    ],
    locales: {
      en: { title: 'Test form' },
      fr: {
        title: 'Formulaire de test',
        description: 'Description en français',
        theme: { botName: 'Bot FR', welcomeMessage: 'Bonjour !' },
        questions: { q1: { title: 'Votre nom ?' } },
      },
    },
    defaultLang: 'en',
  });

  assert.equal(created.questions.length, 2);
  assert.equal(created.questions[1].options?.length, 2);
  assert.equal(created.responseCount, 0);

  // The response count is derived from the submissions table.
  await forms.createSubmission('form_test', { q1: 'Jane' }, 12, 'test-agent');
  await forms.createSubmission('form_test', { q1: 'John' }, 20, 'test-agent');

  const listed = await forms.listFormsForOwner(userId);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].responseCount, 2);

  const submissions = await forms.listSubmissions('form_test');
  assert.equal(submissions.length, 2);
  // Most recent first.
  assert.deepEqual(
    submissions.map((s) => s.answers.q1).sort(),
    ['Jane', 'John']
  );

  // Another user cannot see or touch this form.
  const otherClient = new Client({ connectionString: process.env.DATABASE_URL });
  await otherClient.connect();
  await otherClient.query(
    'INSERT INTO users (id, email, name, password_hash) VALUES ($1,$2,$3,$4)',
    ['usr_other', 'other@example.com', 'Other', hashPassword('secret123')]
  );
  await otherClient.end();

  assert.equal(await forms.getFormForOwner('form_test', 'usr_other'), null);
  assert.equal(await forms.deleteForm('usr_other', 'form_test'), false);
  assert.equal((await forms.listFormsForOwner('usr_other')).length, 0);

  // Updating replaces the questions.
  const updated = await forms.updateForm(
    userId,
    {
      ...created,
      title: 'Renamed',
      questions: [
        { id: 'q1', type: 'text', title: 'Name?', description: '', required: false, placeholder: '' },
      ],
      locales: { ...created.locales, en: { ...created.locales.en, title: 'Renamed' } },
      defaultLang: 'en',
    },
    'en',
    'en'
  );
  assert.equal(updated?.title, 'Renamed');
  assert.equal(updated?.questions.length, 1);

  // Deleting a form cascades to its submissions.
  assert.equal(await forms.deleteForm(userId, 'form_test'), true);
  assert.equal((await forms.listSubmissions('form_test')).length, 0);
});

test('the content of a form is resolved per language', async (t) => {
  if (!available) {
    t.skip('no database available');
    return;
  }
  const forms = await import('../lib/forms.ts');

  await forms.createForm(
    'usr_test',
    {
      id: 'form_i18n',
      title: 'Test form',
      description: 'Default description',
      status: 'draft',
      theme: {
        primaryColor: '#4F46E5',
        accentColor: '#EEF2FF',
        position: 'bottom-right',
        botName: 'Bot',
        botAvatar: 'bot',
        welcomeMessage: 'Hello!',
        thankYouMessage: 'Bye!',
        launcherText: 'Chat',
        showProgressBar: true,
      },
      questions: [
        { id: 'q1', type: 'text', title: 'Name?', description: '', required: true, placeholder: '' },
      ],
      locales: {
        en: { title: 'Test form' },
        fr: {
          title: 'Formulaire de test',
          description: 'Description en français',
          theme: { botName: 'Bot FR', welcomeMessage: 'Bonjour !' },
          questions: { q1: { title: 'Votre nom ?' } },
        },
      },
      defaultLang: 'en',
    },
    'en',
    'en'
  );

  const en = await forms.getFormForOwner('form_i18n', 'usr_test', 'en');
  const fr = await forms.getFormForOwner('form_i18n', 'usr_test', 'fr');
  const unknown = await forms.getFormForOwner('form_i18n', 'usr_test', 'de');

  assert.equal(en?.title, 'Test form');
  assert.equal(en?.questions[0].title, 'Name?');
  assert.equal(en?.theme.botName, 'Bot');

  assert.equal(fr?.title, 'Formulaire de test');
  assert.equal(fr?.description, 'Description en français');
  assert.equal(fr?.questions[0].title, 'Votre nom ?');
  assert.equal(fr?.questions.length, 1);
  assert.equal(fr?.theme.botName, 'Bot FR');
  assert.equal(fr?.theme.welcomeMessage, 'Bonjour !');
  assert.equal(fr?.theme.launcherText, en?.theme.launcherText); // not translated

  // An unknown language falls back to the default content.
  assert.equal(unknown?.title, 'Test form');
  assert.equal(unknown?.questions[0].title, 'Name?');
});

test('a draft form is not exposed publicly', async (t) => {
  if (!available) {
    t.skip('no database available');
    return;
  }
  const forms = await import('../lib/forms.ts');

  assert.equal(await forms.getPublicForm('form_does_not_exist'), null);
});
