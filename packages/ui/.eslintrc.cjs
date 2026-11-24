module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: require.resolve('@typescript-eslint/parser', {
        paths: [__dirname, '../../apps/web'],
      }),
      rules: {},
    },
  ],
};
