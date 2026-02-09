/**
 * Test Data Factory
 * Factory functions for creating consistent test data
 */

const { generateUserId } = require('../mocks/jwt.mock');

// Role IDs matching database schema
const ROLE_IDS = {
    patient: 1,
    doctor: 2,
    nurse: 3,
    lab_technician: 4,
    radiologist: 5,
    pharmacist: 6,
    hospital_admin: 7,
    system_admin: 8,
    insurance_provider: 9,
    researcher: 10,
    compliance_officer: 11
};

/**
 * Create a mock user object
 * @param {Object} overrides - Custom values
 * @returns {Object} User object
 */
const createMockUser = (overrides = {}) => ({
    id: generateUserId(),
    email: `user_${Date.now()}@test.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    password_hash: '$2b$10$mockHashedPassword',
    first_name: 'Test',
    last_name: 'User',
    role_id: ROLE_IDS.patient,
    role_name: 'patient',
    roleName: 'patient', // RBAC middleware uses this
    is_verified: true,
    status: 'active',
    last_login: new Date().toISOString(),
    failed_login_attempts: 0,
    account_locked_until: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
});

/**
 * Create a mock doctor user
 * @param {Object} overrides - Custom values
 * @returns {Object} Doctor user object
 */
const createMockDoctor = (overrides = {}) => createMockUser({
    role_id: ROLE_IDS.doctor,
    role_name: 'doctor',
    roleName: 'doctor',
    first_name: 'Dr. Test',
    ...overrides
});

/**
 * Create a mock patient user
 * @param {Object} overrides - Custom values
 * @returns {Object} Patient user object
 */
const createMockPatient = (overrides = {}) => createMockUser({
    role_id: ROLE_IDS.patient,
    role_name: 'patient',
    roleName: 'patient',
    ...overrides
});

/**
 * Create a mock session object
 * @param {Object} overrides - Custom values
 * @returns {Object} Session object
 */
const createMockSession = (overrides = {}) => {
    const userId = overrides.user_id || generateUserId();
    return {
        id: generateUserId(),
        user_id: userId,
        token_hash: 'mock_token_hash_' + Date.now(),
        refresh_token_hash: 'mock_refresh_hash_' + Date.now(),
        ip_address: '127.0.0.1',
        user_agent: 'Jest Test Agent',
        device_info: { os: 'Test', browser: 'Jest' },
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        is_active: true,
        created_at: new Date().toISOString(),
        ...overrides
    };
};

/**
 * Create an expired session
 * @param {Object} overrides - Custom values
 * @returns {Object} Expired session object
 */
const createExpiredSession = (overrides = {}) => createMockSession({
    expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    ...overrides
});

/**
 * Create a mock consent object
 * @param {Object} overrides - Custom values
 * @returns {Object} Consent object
 */
const createMockConsent = (overrides = {}) => ({
    id: generateUserId(),
    patient_id: generateUserId(),
    recipient_user_id: generateUserId(),
    recipient_organization_id: null,
    data_category: 'ALL_RECORDS',
    purpose: 'TREATMENT',
    access_level: 'read',
    status: 'active',
    start_time: new Date().toISOString(),
    end_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    revoked_at: null,
    revocation_reason: null,
    ...overrides
});

/**
 * Create an expired consent
 * @param {Object} overrides - Custom values
 * @returns {Object} Expired consent object
 */
const createExpiredConsent = (overrides = {}) => createMockConsent({
    end_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'expired',
    ...overrides
});

/**
 * Create a revoked consent
 * @param {Object} overrides - Custom values
 * @returns {Object} Revoked consent object
 */
const createRevokedConsent = (overrides = {}) => createMockConsent({
    status: 'revoked',
    revoked_at: new Date().toISOString(),
    revocation_reason: 'Patient requested revocation',
    ...overrides
});

/**
 * Create a mock visit object
 * @param {Object} overrides - Custom values
 * @returns {Object} Visit object
 */
const createMockVisit = (overrides = {}) => ({
    id: generateUserId(),
    patient_id: generateUserId(),
    organization_id: generateUserId(),
    status: 'in_progress',
    state: 'in_progress',
    visit_code: `VIS-${Date.now()}`,
    visit_type: 'consultation',
    chief_complaint: 'Test complaint',
    start_time: new Date().toISOString(),
    end_time: null,
    checked_in_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    completed_at: null,
    cancelled_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
});

/**
 * Create a completed visit
 * @param {Object} overrides - Custom values
 * @returns {Object} Completed visit object
 */
const createCompletedVisit = (overrides = {}) => createMockVisit({
    status: 'completed',
    state: 'completed',
    completed_at: new Date().toISOString(),
    end_time: new Date().toISOString(),
    ...overrides
});

/**
 * Create a cancelled visit
 * @param {Object} overrides - Custom values
 * @returns {Object} Cancelled visit object
 */
const createCancelledVisit = (overrides = {}) => createMockVisit({
    status: 'cancelled',
    state: 'cancelled',
    cancelled_at: new Date().toISOString(),
    ...overrides
});

/**
 * Create a mock medical record object
 * @param {Object} overrides - Custom values
 * @returns {Object} Medical record object
 */
const createMockMedicalRecord = (overrides = {}) => ({
    id: generateUserId(),
    patient_id: generateUserId(),
    visit_id: generateUserId(),
    type: 'consultation',
    title: 'Test Medical Record',
    description: 'Test description',
    created_by: generateUserId(),
    immutable_flag: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
});

/**
 * Create an immutable medical record
 * @param {Object} overrides - Custom values
 * @returns {Object} Immutable medical record object
 */
const createImmutableMedicalRecord = (overrides = {}) => createMockMedicalRecord({
    immutable_flag: true,
    ...overrides
});

/**
 * Create a mock care team assignment
 * @param {Object} overrides - Custom values
 * @returns {Object} Care team assignment object
 */
const createMockCareTeamAssignment = (overrides = {}) => ({
    id: generateUserId(),
    visit_id: generateUserId(),
    staff_user_id: generateUserId(),
    role: 'primary_doctor',
    assigned_at: new Date().toISOString(),
    assigned_by: generateUserId(),
    removed_at: null,
    removed_by: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
});

/**
 * Create mock Express request object
 * @param {Object} overrides - Custom values
 * @returns {Object} Mock request object
 */
const createMockRequest = (overrides = {}) => ({
    headers: {
        authorization: 'Bearer mock_token',
        'user-agent': 'Jest Test Agent',
        ...overrides.headers
    },
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
    ip: overrides.ip || '127.0.0.1',
    path: overrides.path || '/test',
    method: overrides.method || 'GET',
    user: overrides.user || null,
    session: overrides.session || null,
    file: overrides.file || null,
    ...overrides
});

/**
 * Create mock Express response object
 * @returns {Object} Mock response object with jest functions
 */
const createMockResponse = () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis()
    };
    return res;
};

/**
 * Create mock next function
 * @returns {Function} Mock next function
 */
const createMockNext = () => jest.fn();

module.exports = {
    ROLE_IDS,
    // Users
    createMockUser,
    createMockDoctor,
    createMockPatient,
    // Sessions
    createMockSession,
    createExpiredSession,
    // Consents
    createMockConsent,
    createExpiredConsent,
    createRevokedConsent,
    // Visits
    createMockVisit,
    createCompletedVisit,
    createCancelledVisit,
    // Medical Records
    createMockMedicalRecord,
    createImmutableMedicalRecord,
    // Care Team
    createMockCareTeamAssignment,
    // Express mocks
    createMockRequest,
    createMockResponse,
    createMockNext
};
