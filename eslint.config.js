import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.vercel/**', 'supabase/.temp/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        FormData: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        caches: 'readonly',
        crypto: 'readonly',
        console: 'readonly',
        self: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Image: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        Path2D: 'readonly',
        Event: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        globalThis: 'readonly'
      },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    }
  }
];
