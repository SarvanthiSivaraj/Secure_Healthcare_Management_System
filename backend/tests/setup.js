/**
 * Jest Test Setup
 * Global configuration and mocks for security-focused testing
 */

// Global setup before all tests
beforeAll(async () => {
    console.log('✓ Jest test environment initialized');
    console.log('  Tests will mock database calls - no real DB connection needed during unit tests');
});

// Global teardown after all tests
afterAll(async () => {
    console.log('✓ Test suite completed');
});

// Clean up between tests
afterEach(() => {
    jest.clearAllMocks();
});

// Mock logger to prevent console spam during tests
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
}));

// Mock config/db to provide a mockable query function
jest.mock('../src/config/db', () => ({
    query: jest.fn(),
    pool: {
        query: jest.fn(),
        connect: jest.fn().mockResolvedValue({
            query: jest.fn(),
            release: jest.fn()
        }),
        end: jest.fn().mockResolvedValue(undefined),
        on: jest.fn()
    }
}));

// Export test utilities
module.exports = {
    // Helper to get mocked db
    getMockedDb: () => require('../src/config/db')
};
