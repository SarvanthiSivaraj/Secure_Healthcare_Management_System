'use strict';

module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/integration/**/*.test.js'],
    globalSetup: './tests/helpers/dbSetup.js',
    globalTeardown: './tests/helpers/dbTeardown.js',
    testTimeout: 30000,
    // Run integration tests serially to avoid DB conflicts
    maxWorkers: 1,
    // Verbose output
    verbose: true,
    // reporter
    reporters: ['default'],
    // Collect coverage from backend src
    collectCoverage: false,
    coverageDirectory: 'coverage/integration',
    coverageReporters: ['lcov', 'text'],
    collectCoverageFrom: [
        'src/modules/**/*.js',
        'src/middleware/**/*.js',
        'src/services/**/*.js',
        '!src/modules/**/*.routes.js',
    ],
    // Each test file gets a fresh module registry
    clearMocks: true,
    restoreMocks: true,
    // Allow tests to set env vars via dotenv
    setupFiles: ['./tests/helpers/loadTestEnv.js'],
};
