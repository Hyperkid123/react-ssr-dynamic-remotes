module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
    'prettier'
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json'
  },
  plugins: [
    'react'
  ],
  rules: {
  },
  files: ['./**/*.{ts,tsx}'],
}
