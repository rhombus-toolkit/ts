// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config({
  // Type-aware rule set over every library's source (tests are colocated
  // *.test.ts/*.spec.ts files under the same src tree, so one block covers both)
  // plus the tests/ workspace's cross-package smoke fixtures.
  files: ['libraries/*/src/**/*.ts', 'tests/src/**/*.ts'],
  extends: [tseslint.configs.base],
  languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  rules: { curly: ['error', 'all'],
    '@typescript-eslint/strict-boolean-expressions': ['error', { allowNullableBoolean: true, allowNullableString: true,
      allowNullableNumber: true }], '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }] },
});
