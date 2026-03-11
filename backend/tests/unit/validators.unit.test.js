/**
 * Unit tests for src/utils/validators.js
 * Uses Vitest (no DB required)
 */
import { describe, it, expect } from 'vitest';
import {
    isValidEmail,
    isValidPhone,
    validatePassword,
    isValidDate,
    isValidUUID,
    validateRequiredFields,
} from '../../src/utils/validators.js';

describe('isValidEmail', () => {
    it('accepts valid emails', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('test.name+alias@domain.co')).toBe(true);
    });

    it('rejects invalid emails', () => {
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail('notanemail')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
    });
});

describe('isValidPhone', () => {
    it('accepts valid phone numbers', () => {
        expect(isValidPhone('+1234567890')).toBe(true);
        expect(isValidPhone('1234567890')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
        expect(isValidPhone('')).toBe(false);
        expect(isValidPhone(null)).toBe(false);
        expect(isValidPhone('abc')).toBe(false);
    });
});

describe('validatePassword', () => {
    it('accepts strong passwords', () => {
        const result = validatePassword('StrongP@ss1');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('rejects password with no uppercase', () => {
        const result = validatePassword('weakpass@1');
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('rejects password shorter than 8 chars', () => {
        const result = validatePassword('Ab@1');
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('8 characters'))).toBe(true);
    });

    it('rejects password with no special character', () => {
        const result = validatePassword('NoSpecial1');
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('special character'))).toBe(true);
    });

    it('returns error for null/empty password', () => {
        const result = validatePassword(null);
        expect(result.isValid).toBe(false);
    });

    it('rejects password with no number', () => {
        const result = validatePassword('NoNumber@AB');
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });
});

describe('isValidDate', () => {
    it('accepts valid dates', () => {
        expect(isValidDate('2000-01-15')).toBe(true);
        expect(isValidDate('1990-12-31')).toBe(true);
    });

    it('rejects invalid dates', () => {
        expect(isValidDate('')).toBe(false);
        expect(isValidDate(null)).toBe(false);
        expect(isValidDate('01-01-2000')).toBe(false);
        expect(isValidDate('not-a-date')).toBe(false);
    });
});

describe('isValidUUID', () => {
    it('accepts valid UUIDs', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('rejects invalid UUIDs', () => {
        expect(isValidUUID('')).toBe(false);
        expect(isValidUUID(null)).toBe(false);
        expect(isValidUUID('not-a-uuid')).toBe(false);
    });
});

describe('validateRequiredFields', () => {
    it('returns isValid=true when all fields present', () => {
        const data = { email: 'a@b.com', password: 'pass' };
        const result = validateRequiredFields(data, ['email', 'password']);
        expect(result.isValid).toBe(true);
        expect(result.missing).toHaveLength(0);
    });

    it('returns missing fields list', () => {
        const data = { email: 'a@b.com' };
        const result = validateRequiredFields(data, ['email', 'password']);
        expect(result.isValid).toBe(false);
        expect(result.missing).toContain('password');
    });
});
