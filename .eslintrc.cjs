module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'astro', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
  ],
  rules: {
    'astro/no-set-html-directive': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
  },
  ignorePatterns: ['dist', 'node_modules', 'public'],
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      rules: {
        'astro/no-unused-variables': 'error',
      },
    },
  ],
};
