/**
 * JWT Mock Utilities
 * Helpers for mocking JWT token operations in tests
 */

const crypto = require('crypto');

/**
 * Generate a mock user ID (UUID v4 format)
 * @returns {string} UUID string
 */
const generateUserId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Create a mock JWT payload
 * @param {Object} overrides - Custom payload values
 * @returns {Object} JWT payload
 */
const createMockPayload = (overrides = {}) => ({
    userId: generateUserId(),
    roleId: 1,
    roleName: 'patient',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    ...overrides
});

/**
 * Create an expired JWT payload
 * @param {Object} overrides - Custom payload values
 * @returns {Object} Expired JWT payload
 */
const createExpiredPayload = (overrides = {}) => ({
    ...createMockPayload(overrides),
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
});

/**
 * Create a mock token string
 * @param {Object} payload - Token payload
 * @returns {string} Base64 encoded mock token
 */
const createMockToken = (payload = {}) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(createMockPayload(payload))).toString('base64');
    const signature = crypto.randomBytes(32).toString('base64');
    return `${header}.${body}.${signature}`;
};

/**
 * Mock JWT module for testing
 * Use with: jest.mock('../src/config/jwt', () => require('./mocks/jwt.mock').mockJwtModule)
 */
const mockJwtModule = {
    generateAccessToken: jest.fn().mockImplementation((payload) => createMockToken(payload)),
    generateRefreshToken: jest.fn().mockImplementation((payload) => createMockToken(payload)),
    verifyAccessToken: jest.fn().mockImplementation(() => createMockPayload()),
    verifyRefreshToken: jest.fn().mockImplementation(() => createMockPayload()),
    generateTokenPair: jest.fn().mockImplementation((payload) => ({
        accessToken: createMockToken(payload),
        refreshToken: createMockToken(payload)
    }))
};

/**
 * Setup JWT verification to return specific payload
 * @param {Object} payload - Payload to return
 */
const setupVerifyToken = (payload) => {
    mockJwtModule.verifyAccessToken.mockReturnValue(payload);
};

/**
 * Setup JWT verification to throw error
 * @param {string} errorMessage - Error message
 */
const setupVerifyTokenError = (errorMessage = 'Invalid token') => {
    mockJwtModule.verifyAccessToken.mockImplementation(() => {
        throw new Error(errorMessage);
    });
};

module.exports = {
    generateUserId,
    createMockPayload,
    createExpiredPayload,
    createMockToken,
    mockJwtModule,
    setupVerifyToken,
    setupVerifyTokenError
};
