/**
 * Database Mock Utilities
 * Helpers for mocking pg database queries in tests
 */

/**
 * Create a mock query result
 * @param {Array} rows - Array of row objects to return
 * @param {number} rowCount - Optional row count (defaults to rows.length)
 * @returns {Object} Mock query result
 */
const createQueryResult = (rows = [], rowCount = null) => ({
    rows,
    rowCount: rowCount !== null ? rowCount : rows.length,
    command: 'SELECT',
    oid: null,
    fields: []
});

/**
 * Create a mock pool with configurable query behavior
 * @param {Object} queryResponses - Map of query patterns to responses
 * @returns {Object} Mock pool object
 */
const createMockPool = (queryResponses = {}) => {
    const mockQuery = jest.fn().mockImplementation((sql, params) => {
        // Check for matching query pattern
        for (const [pattern, response] of Object.entries(queryResponses)) {
            if (sql.includes(pattern)) {
                if (typeof response === 'function') {
                    return Promise.resolve(response(sql, params));
                }
                return Promise.resolve(response);
            }
        }
        // Default empty result
        return Promise.resolve(createQueryResult([]));
    });

    return {
        query: mockQuery,
        connect: jest.fn().mockResolvedValue({
            query: mockQuery,
            release: jest.fn()
        }),
        end: jest.fn().mockResolvedValue(undefined),
        on: jest.fn()
    };
};

/**
 * Mock database module
 * Use with: jest.mock('../src/config/db', () => require('./mocks/db.mock').mockDbModule)
 */
const mockDbModule = {
    query: jest.fn(),
    pool: createMockPool()
};

/**
 * Setup query mock for specific test
 * @param {Function} queryFn - The mock query function
 * @param {Array} responses - Array of responses in order
 */
const setupQuerySequence = (queryFn, responses) => {
    responses.forEach((response, index) => {
        queryFn.mockResolvedValueOnce(
            response.error
                ? Promise.reject(response.error)
                : createQueryResult(response.rows || [], response.rowCount)
        );
    });
};

module.exports = {
    createQueryResult,
    createMockPool,
    mockDbModule,
    setupQuerySequence
};
