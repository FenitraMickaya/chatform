import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateForm,
  validateQuestion,
  validateSignIn,
  validateSignUp,
  validateSubmission,
} from '../lib/validation.ts';

test('validateForm accepts a minimal valid form', () => {
  const result = validateForm({
    id: 'form_1',
    title: 'Contact',
    questions: [{ id: 'q1', type: 'text', title: 'Your name?', required: true }],
    theme: { primaryColor: '#4F46E5' },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.questions.length, 1);
  assert.equal(result.value.questions[0].required, true);
  assert.equal(result.value.theme.position, 'bottom-right');
  assert.equal(result.value.status, 'draft');
});

test('validateForm rejects a form without id, title or questions', () => {
  assert.equal(validateForm({ title: 'x', questions: [] }).ok, false);
  assert.equal(validateForm({ id: 'a', questions: [] }).ok, false);
  assert.equal(validateForm({ id: 'a', title: 'x', questions: [] }).ok, false);
  assert.equal(validateForm(null).ok, false);
});

test('validateForm drops unknown fields and normalises the theme', () => {
  const result = validateForm({
    id: 'form_1',
    title: 'Contact',
    evil: '<script>alert(1)</script>',
    questions: [{ id: 'q1', type: 'text', title: 'Name?', extra: 1 }],
    theme: { primaryColor: 'not-a-color', position: 'top-center', botAvatar: 'nope' },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal('evil' in (result.value as any), false);
  assert.equal(result.value.theme.primaryColor, '#4F46E5');
  assert.equal(result.value.theme.position, 'bottom-right');
  assert.equal(result.value.theme.botAvatar, 'bot');
});

test('validateQuestion requires at least two options for a multiple choice', () => {
  const bad = validateQuestion({ id: 'q1', type: 'multiple_choice', title: 'Pick', options: ['only'] }, 0);
  assert.equal(bad.ok, false);

  const good = validateQuestion(
    { id: 'q1', type: 'multiple_choice', title: 'Pick', options: ['a', 'b'] },
    0
  );
  assert.equal(good.ok, true);
});

test('validateQuestion clamps the rating range', () => {
  const result = validateQuestion({ id: 'q1', type: 'rating', title: 'Rate', minRating: 0, maxRating: 99 }, 0);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.minRating, 1);
  assert.equal(result.value.maxRating, 10);
});

test('validateSubmission enforces the answer types', () => {
  const ok = validateSubmission({ answers: { q1: 'text', q2: 5, q3: ['a'] }, completionTimeSeconds: 12 });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.value.completionTimeSeconds, 12);

  assert.equal(validateSubmission({ answers: { q1: { nested: true } } }).ok, false);
  assert.equal(validateSubmission({}).ok, false);
  assert.equal(validateSubmission({ answers: {}, completionTimeSeconds: -5 }).ok, true);
});

test('validateSignUp enforces email and password rules', () => {
  assert.equal(validateSignUp({ name: 'A', email: 'a@b.co', password: '123456' }).ok, true);
  assert.equal(validateSignUp({ name: 'A', email: 'nope', password: '123456' }).ok, false);
  assert.equal(validateSignUp({ name: 'A', email: 'a@b.co', password: '123' }).ok, false);
  assert.equal(validateSignUp({ name: '', email: 'a@b.co', password: '123456' }).ok, false);
});

test('validateSignIn requires both fields', () => {
  assert.equal(validateSignIn({ email: 'a@b.co', password: 'x' }).ok, true);
  assert.equal(validateSignIn({ email: 'a@b.co' }).ok, false);
});
