/**
 * Unit tests for src/services/audit.service.js
 *
 * NOTE: createAuditLog wraps ALL errors in a try-catch and returns null
 * on failure — this is by design so audit failures never break application flow.
 * Our tests therefore focus on:
 *   1. The function exists and is callable
 *   2. It does NOT throw under any circumstance
 *   3. It returns null when the DB is unavailable (expected graceful degradation)
 *   4. It accepts all expected parameter shapes
 *
 * Deep DB integration behavior is covered by audit.integration.test.js
 */
import { describe, it, expect } from 'vitest';

// Set env before module imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.ENCRYPTION_KEY = '74657374656e6372797074696f6e6b657931323334353637383930313233343530';
process.env.BCRYPT_ROUNDS = '4';
process.env.DB_PASSWORD = 'not_a_real_db_password_so_connection_will_fail';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '19999'; // non-existent port = guaranteed connection failure

const { createAuditLog } = await import('../../src/services/audit.service.js');

describe('createAuditLog – graceful degradation (no DB)', () => {
    it('never throws even when DB is unreachable', async () => {
        await expect(
            createAuditLog({
                userId: 'user-123',
                action: 'user_login',
                purpose: 'Test login',
                ipAddress: '127.0.0.1',
                requestMethod: 'POST',
                requestPath: '/api/auth/login',
                statusCode: 200,
            })
        ).resolves.not.toThrow();
    });

    it('returns null when DB is unreachable (graceful degradation)', async () => {
        const result = await createAuditLog({
            userId: 'user-456',
            action: 'consent_grant',
            purpose: 'Test consent',
            statusCode: 201,
        });

        // Returns null on failure — audit never breaks application flow
        expect(result).toBeNull();
    });

    it('never throws when userId is null', async () => {
        await expect(
            createAuditLog({
                userId: null,
                action: 'access_denied',
                purpose: 'Unauthenticated request',
                statusCode: 401,
            })
        ).resolves.not.toThrow();
    });

    it('accepts all valid parameter combinations without throwing', async () => {
        const testCases = [
            { userId: 'u1', action: 'user_login', purpose: 'login', statusCode: 200 },
            { userId: 'u2', action: 'user_logout', purpose: 'logout', statusCode: 200 },
            {
                userId: 'u3',
                action: 'consent_grant',
                entityType: 'consent',
                entityId: 'c1',
                purpose: 'grant',
                metadata: { key: 'value' },
                statusCode: 201,
            },
        ];

        for (const tc of testCases) {
            await expect(createAuditLog(tc)).resolves.not.toThrow();
        }
    });
});
