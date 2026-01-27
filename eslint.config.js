// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const next = require('eslint-config-next');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = tseslint.config(
    // 基础配置
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    next,
    prettier,

    // 自定义规则
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            // 行数限制规则 - 每个文件不超过300行
            'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],

            // TypeScript规则
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // React/Next.js规则
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            // 代码质量规则
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],

            // Prettier集成
            'prettier/prettier': ['error', {}, { usePrettierrc: true }],
        },
    },

    // 忽略文件配置
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'dist/**',
            'build/**',
            '*.config.js',
            '*.config.ts',
            'next.config.js',
            '*.log',
            '*.lock',
            '*.tsbuildinfo',
            '.env*',
            '!env.example',
            'coverage/**',
            '__tests__/**',
            '*.test.ts',
            '*.test.tsx',
            '*.spec.ts',
            '*.spec.tsx',
            'doc/**',
            '*.md',
            '.vscode/**',
            '.idea/**',
            '.DS_Store',
            'Thumbs.db',
        ],
    },

    // 测试文件覆盖
    {
        files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
        rules: {
            'max-lines': 'off',
            'no-console': 'off',
        },
    },

    // 配置文件覆盖
    {
        files: ['**/*.config.js', '**/*.config.ts', 'next.config.js'],
        rules: {
            'max-lines': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
);