/**
 * Shared test utilities for integration tests.
 *
 * Key helpers:
 *  - getPool()           → get a pg Pool connected to test DB
 *  - truncateAll()       → wipe all rows between tests
 *  - createVerifiedUser()→ insert a user with active/verified status + session
 *  - loginAs()           → do a real POST /api/auth/login and return token + userId
 *  - authHeader()        → returns { Authorization: 'Bearer <token>' }
 *  - getAuditEntries()   → query audit_logs for a given action/userId
 *  - insertOrg()         → insert a test organization
 */

'use strict';

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const request = require('supertest');
const path = require('path');

// Load test env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

let _pool = null;

/**
 * Get (or create) the shared pg Pool for the test DB.
 */
function getPool() {
    if (!_pool) {
        _pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5433,
            database: process.env.DB_NAME || 'healthcare_test_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        });
    }
    return _pool;
}

/**
 * Close the shared pool (call in afterAll of each test file).
 */
async function closePool() {
    if (_pool) {
        await _pool.end();
        _pool = null;
    }
}

/**
 * Truncate all test tables and restart sequences.
 * Call in beforeEach to isolate tests.
 */
async function truncateAll() {
    const pool = getPool();
    // Order matters for FK constraints – parent tables last
    await pool.query(`
        TRUNCATE TABLE
            audit_logs,
            sessions,
            otp_verifications,
            security_events,
            passkey_credentials,
            emergency_access,
            lab_results,
            imaging_reports,
            prescriptions,
            diagnoses,
            medical_records,
            imaging_orders,
            visit_staff_assignments,
            visits,
            consents,
            access_policies,
            staff_org_mapping,
            doctor_profiles,
            patient_profiles,
            organizations,
            users
        RESTART IDENTITY CASCADE
    `);
}

/**
 * Get (or cache) the role ID for a given role name.
 */
const _roleCache = {};
async function getRoleId(roleName) {
    if (_roleCache[roleName]) return _roleCache[roleName];
    const pool = getPool();
    const result = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (result.rows.length === 0) throw new Error(`Role '${roleName}' not found in DB`);
    _roleCache[roleName] = result.rows[0].id;
    return result.rows[0].id;
}

/**
 * Insert a fully verified, active user directly into the DB.
 * This bypasses OTP flow entirely – suitable for setting up test fixtures.
 *
 * @param {string} role  - Role name (e.g. 'doctor', 'patient', 'hospital_admin')
 * @param {object} overrides - Optional field overrides
 * @returns {{ id, email, password, roleName }}
 */
async function createVerifiedUser(role = 'patient', overrides = {}) {
    const pool = getPool();
    const roleId = await getRoleId(role);

    const email = overrides.email || `${role}_${uuidv4().slice(0, 8)}@test.com`;
    const rawPassword = overrides.password || 'TestPass@123';
    const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 4;
    const passwordHash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);

    const result = await pool.query(
        `INSERT INTO users (email, password_hash, role_id, first_name, last_name, status, is_verified)
         VALUES ($1, $2, $3, $4, $5, 'active', true)
         RETURNING id, email, role_id`,
        [
            email,
            passwordHash,
            roleId,
            overrides.firstName || 'Test',
            overrides.lastName || role.charAt(0).toUpperCase() + role.slice(1),
        ]
    );

    const user = result.rows[0];

    // Create patient profile if role is patient
    if (role === 'patient') {
        const healthId = `HID${Date.now()}`;
        await pool.query(
            `INSERT INTO patient_profiles (user_id, unique_health_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO NOTHING`,
            [user.id, healthId]
        );
    }

    // Create doctor profile if role is doctor
    if (role === 'doctor') {
        await pool.query(
            `INSERT INTO doctor_profiles (user_id, specialization, license_number)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id) DO NOTHING`,
            [user.id, overrides.specialization || 'General', `LIC${uuidv4().slice(0, 8).toUpperCase()}`]
        );
    }

    return {
        id: user.id,
        email,
        password: rawPassword,
        roleName: role,
    };
}

/**
 * Insert a test organization and return its id and hospital_code.
 * Optionally link an adminUserId to it.
 */
async function insertOrg(overrides = {}) {
    const pool = getPool();
    const licenseNumber = overrides.licenseNumber || `LIC${uuidv4().slice(0, 8).toUpperCase()}`;

    const result = await pool.query(
        `INSERT INTO organizations
            (name, type, license_number, status, admin_user_id)
         VALUES ($1, $2, $3, 'active', $4)
         RETURNING *`,
        [
            overrides.name || 'Test Hospital',
            overrides.type || 'hospital',
            licenseNumber,
            overrides.adminUserId || null,
        ]
    );
    return result.rows[0];
}

/**
 * Link a user to an organization in staff_org_mapping.
 */
async function linkStaffToOrg(userId, orgId, roleName) {
    const pool = getPool();
    const roleId = await getRoleId(roleName);
    await pool.query(
        `INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id, organization_id) DO NOTHING`,
        [userId, orgId, roleId]
    );
}

/**
 * Perform a real POST /api/auth/login and return accessToken + userId.
 * The app must be the Express app instance.
 *
 * @param {object} app      - Express app
 * @param {string} email    - User email
 * @param {string} password - User password
 * @returns {{ accessToken, userId }}
 */
async function loginAs(app, email, password) {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

    if (res.status !== 200) {
        throw new Error(
            `loginAs failed for ${email}: HTTP ${res.status} – ${JSON.stringify(res.body)}`
        );
    }

    const token = res.body.data?.accessToken || res.body.token;
    if (!token) {
        throw new Error(`loginAs: no accessToken returned – ${JSON.stringify(res.body)}`);
    }

    return {
        accessToken: token,
        userId: res.body.data?.user?.id,
    };
}

/**
 * Return an Authorization header object for supertest.
 */
function authHeader(token) {
    return { Authorization: `Bearer ${token}` };
}

/**
 * Query audit_logs for a given action (and optionally userId).
 *
 * @param {string} action  - Audit action string (e.g. 'user_login')
 * @param {string} userId  - (optional) filter by user_id
 * @returns {Array} Matching audit log rows
 */
async function getAuditEntries(action, userId = null) {
    const pool = getPool();
    if (userId) {
        const result = await pool.query(
            'SELECT * FROM audit_logs WHERE action = $1 AND user_id = $2 ORDER BY timestamp DESC',
            [action, userId]
        );
        return result.rows;
    }
    const result = await pool.query(
        'SELECT * FROM audit_logs WHERE action = $1 ORDER BY timestamp DESC',
        [action]
    );
    return result.rows;
}

/**
 * Create a visit record directly in the DB.
 */
async function createVisit(patientId, orgId, status = 'scheduled') {
    const pool = getPool();
    const visitCode = `VC${Date.now()}`;
    const result = await pool.query(
        `INSERT INTO visits (patient_id, organization_id, status, visit_code)
         VALUES ($1, $2, $3, $4)
         RETURNING id, status, visit_code`,
        [patientId, orgId, status, visitCode]
    );
    return result.rows[0];
}

/**
 * Create a medical record directly in the DB.
 */
async function createMedicalRecord(patientId, visitId, createdBy) {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO medical_records (patient_id, visit_id, type, title, created_by)
         VALUES ($1, $2, 'consultation', 'Test Record', $3)
         RETURNING id`,
        [patientId, visitId, createdBy]
    );
    return result.rows[0];
}

/**
 * Grant consent directly in DB (bypasses API).
 */
async function grantConsent(patientId, recipientUserId, options = {}) {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO consents
            (patient_id, recipient_user_id, data_category, purpose, access_level, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         RETURNING id`,
        [
            patientId,
            recipientUserId,
            options.dataCategory || 'ALL_RECORDS',
            options.purpose || 'TREATMENT',
            options.accessLevel || 'read',
        ]
    );
    return result.rows[0];
}

module.exports = {
    getPool,
    closePool,
    truncateAll,
    getRoleId,
    createVerifiedUser,
    insertOrg,
    linkStaffToOrg,
    loginAs,
    authHeader,
    getAuditEntries,
    createVisit,
    createMedicalRecord,
    grantConsent,
};
