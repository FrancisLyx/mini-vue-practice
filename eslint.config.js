const eslint = require('@eslint/js')
const globals = require('globals')
const eslintPrettier = require('eslint-plugin-prettier')
const importSort = require('eslint-plugin-simple-import-sort')

const tseslint = require('typescript-eslint')

const ignores = [
    'dist',
    'build',
    '**/*.js',
    '**/*.mjs',
    '**/*.d.ts',
    'eslint.config.js',
    'commitlint.config.js'
]

const frontendConfig = {
    files: ['application/frontend/**/*.{ts,tsx}'],
    ignores: [],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
    },
    plugins: {
    },
    rules: {
        'no-console': 'error',
    },
}


module.exports = tseslint.config(
    {
        ignores,
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
        plugins: {
            prettier: eslintPrettier,
            'simple-import-sort': importSort,
        },
        rules: {
            'prettier/prettier': 'error',
            'simple-import-sort/imports': 'error',
        },
    },
    frontendConfig
)
