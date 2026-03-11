/**
 * Unit tests for src/services/encryption.service.js
 * Uses Vitest (no DB required)
 */
import { describe, it, expect } from 'vitest';
import {
    hashPassword,
    comparePassword,
    hashOTP,
    hashToken,
    hashGovtId,
    createHashChain,
} from '../../src/services/encryption.service.js';

describe('hashPassword / comparePassword', () => {
    it('hashes a password and verifies it correctly', async () => {
        const raw = 'MySecure@Pass1';
        const hash = await hashPassword(raw);
        expect(hash).not.toBe(raw);
        expect(hash.length).toBeGreaterThan(20);
        const match = await comparePassword(raw, hash);
        expect(match).toBe(true);
    });

    it('returns false when comparing wrong password', async () => {
        const hash = await hashPassword('CorrectPass@1');
        const match = await comparePassword('WrongPass@1', hash);
        expect(match).toBe(false);
    });

    it('produces different hashes for the same input each time', async () => {
        const hash1 = await hashPassword('SamePass@1');
        const hash2 = await hashPassword('SamePass@1');
        expect(hash1).not.toBe(hash2); // bcrypt adds random salt
    });
});

describe('hashOTP', () => {
    it('produces a consistent SHA-256 hash for the same OTP', () => {
        const otp = '123456';
        expect(hashOTP(otp)).toBe(hashOTP(otp));
    });

    it('produces different hashes for different OTPs', () => {
        expect(hashOTP('111111')).not.toBe(hashOTP('222222'));
    });
});

describe('hashToken', () => {
    it('produces a consistent SHA-256 hash for the same token', () => {
        const token = 'eyJhbGciOiJIUzI1NiJ9.payload.signature';
        expect(hashToken(token)).toBe(hashToken(token));
    });
});

describe('hashGovtId', () => {
    it('returns a 64-char hex string', () => {
        const hash = hashGovtId('AADHAAR1234567890');
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
});

describe('createHashChain', () => {
    it('creates a chain by combining previous hash and current data', () => {
        const h1 = createHashChain('data1', '');
        const h2 = createHashChain('data2', h1);
        expect(h1).toMatch(/^[a-f0-9]{64}$/);
        expect(h2).not.toBe(h1);
    });

    it('is deterministic for same inputs', () => {
        expect(createHashChain('foo', 'bar')).toBe(createHashChain('foo', 'bar'));
    });
});
