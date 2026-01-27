/** @type {import('jest').Config} */
const config = {
    // 测试环境
    testEnvironment: 'node',

    // 测试文件匹配模式
    testMatch: [
        '<rootDir>/test/unit/**/*.test.ts',
        '<rootDir>/test/unit/**/*.spec.ts',
        '<rootDir>/test/integration/**/*.test.ts',
        '<rootDir>/test/integration/**/*.spec.ts',
    ],

    // 测试覆盖率配置
    collectCoverage: true,
    coverageDirectory: '<rootDir>/test/coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
    ],

    // 模块映射
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // 测试前执行的脚本
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

    // 转换配置
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },

    // 忽略的路径
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/test/e2e/',
        '<rootDir>/test/fixtures/',
        '<rootDir>/test/mocks/',
    ],

    // 模块文件扩展名
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // 根目录
    roots: ['<rootDir>/src', '<rootDir>/test'],

    // 测试超时时间
    testTimeout: 10000,
};

module.exports = config;