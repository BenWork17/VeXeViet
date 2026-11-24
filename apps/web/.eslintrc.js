module.exports = {
  extends: [require.resolve('../../packages/config/eslint/next.js'), 'next/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
