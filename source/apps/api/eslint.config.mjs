// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

/**
 * ESLint Flat Config cho NestJS backend.
 * Ưu điểm:
 * - Tích hợp Prettier hoàn chỉnh
 * - Hỗ trợ type-check nâng cao (projectService)
 * - Import order logic rõ ràng cho backend
 * - Quy tắc async-safety
 * - Loại trừ các thư mục build và môi trường
 */

export default tseslint.config(
  // Block 1: Ignore các file/thư mục không cần lint
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.js', 'eslint.config.mjs'],
  },

  // Block 2: Recommended từ ESLint (JS)
  eslint.configs.recommended,

  // Block 3: Recommended từ TypeScript-ESLint (có type checking)
  ...tseslint.configs.recommendedTypeChecked,

  // Block 4: Prettier plugin + tắt rule xung đột
  prettierPlugin,

  // Block 5: Cấu hình môi trường
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Block 6: Quy tắc lint
  {
    rules: {
      // ---------- TypeScript ----------
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

      // ---------- Code Style ----------
      'no-console': 'warn',
      'no-unused-vars': 'off', // tắt để dùng rule TS
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ---------- Import Order ----------
      // "import/order": [
      //   "error",
      //   {
      //     groups: [
      //       "builtin",
      //       "external",
      //       "internal",
      //       ["parent", "sibling"],
      //       "index",
      //     ],
      //     "newlines-between": "always",
      //     alphabetize: { order: "asc" },
      //   },
      // ],
    },
  },
  {
    plugins: {
      import: importPlugin,
    },
  },
);
