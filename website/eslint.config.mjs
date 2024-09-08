import eslint from '@eslint/js';
// TODO: Add back `eslint-plugin-react-hooks once it supports the ESLint flat file format.
// import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ESLint.
  eslint.configs.recommended,

  // TypeScript.
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // Custom.
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    ignores: ['**/dist'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  }
);
