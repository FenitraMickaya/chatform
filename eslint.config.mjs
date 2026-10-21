import next from 'eslint-config-next';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * ESLint flat configuration.
 *
 * eslint-config-next v16 ships flat configs, so they are used directly
 * instead of the legacy FlatCompat bridge.
 */
const eslintConfig = [
  ...next,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];

export default eslintConfig;
