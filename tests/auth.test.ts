import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/auth.ts';

test('a password is never stored in clear text', () => {
  const stored = hashPassword('super-secret');
  assert.notEqual(stored, 'super-secret');
  assert.match(stored, /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
  assert.equal(stored.includes('super-secret'), false);
});

test('the same password hashes differently every time (random salt)', () => {
  const a = hashPassword('super-secret');
  const b = hashPassword('super-secret');
  assert.notEqual(a, b);
});

test('verifyPassword accepts the right password and rejects the wrong one', () => {
  const stored = hashPassword('super-secret');
  assert.equal(verifyPassword('super-secret', stored), true);
  assert.equal(verifyPassword('Super-Secret', stored), false);
  assert.equal(verifyPassword('', stored), false);
});

test('verifyPassword rejects malformed or empty hashes', () => {
  assert.equal(verifyPassword('anything', ''), false);
  assert.equal(verifyPassword('anything', 'plaintext'), false);
  assert.equal(verifyPassword('anything', 'md5$abc$def'), false);
});
