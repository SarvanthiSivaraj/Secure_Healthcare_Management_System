/**
 * Jest Configuration for Healthcare Backend
 * Security-focused unit testing configuration
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Root directory
    rootDir: '.',

    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],

    // Files to ignore
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/*.js',
        '!src/database/migrate*.js'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },

    // Coverage directory
    coverageDirectory: 'coverage',

    // Coverage reporters
    coverageReporters: ['text', 'lcov', 'html'],

    // Module path aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1'
    },

    // Verbose output
    verbose: true,

    // Test timeout (10 seconds)
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true
};
