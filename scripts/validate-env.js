#!/usr/bin/env node
// ============================================================
// Environment Variable Validator
// ============================================================
// Validates that all required environment variables are set
// before starting the application or running migrations.
//
// Usage:
//   node scripts/validate-env.js              # validate for development
//   node scripts/validate-env.js --env prod   # validate for production
// ============================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Variable Definitions ──────────────────────────────────
// Each entry: { name, required: [envs], description, validate? }

const ENV_SCHEMA = [
  // Server
  { name: 'NODE_ENV',          required: ['dev', 'prod'], description: 'Runtime environment',                  validate: (v) => ['development', 'production', 'test'].includes(v) },
  { name: 'PORT',              required: ['dev', 'prod'], description: 'API server port',                      validate: (v) => !isNaN(v) && +v > 0 && +v < 65536 },

  // Database
  { name: 'DB_HOST',           required: ['prod'],        description: 'PostgreSQL host' },
  { name: 'DB_PORT',           required: [],              description: 'PostgreSQL port',                      validate: (v) => !isNaN(v) },
  { name: 'DB_NAME',           required: ['prod'],        description: 'PostgreSQL database name' },
  { name: 'DB_USER',           required: ['prod'],        description: 'PostgreSQL user' },
  { name: 'DB_PASSWORD',       required: ['dev', 'prod'], description: 'PostgreSQL password',                  sensitive: true },

  // JWT (Tier 1 Secrets)
  { name: 'JWT_SECRET',        required: ['dev', 'prod'], description: 'JWT signing secret',                   sensitive: true, validate: (v) => v.length >= 32 },
  { name: 'JWT_REFRESH_SECRET',required: ['dev', 'prod'], description: 'JWT refresh token secret',             sensitive: true, validate: (v) => v.length >= 32 },
  { name: 'JWT_EXPIRES_IN',    required: [],              description: 'JWT access token expiry (e.g. 1h)' },
  { name: 'JWT_REFRESH_EXPIRES_IN', required: [],         description: 'JWT refresh token expiry (e.g. 7d)' },

  // Encryption (Tier 1 Secret)
  { name: 'ENCRYPTION_KEY',    required: ['dev', 'prod'], description: 'AES-256 encryption key',               sensitive: true, validate: (v) => v.length >= 32 },

  // Email
  { name: 'EMAIL_HOST',        required: ['prod'],        description: 'SMTP server host' },
  { name: 'EMAIL_PORT',        required: ['prod'],        description: 'SMTP server port' },
  { name: 'EMAIL_USER',        required: ['prod'],        description: 'SMTP user' },
  { name: 'EMAIL_PASSWORD',    required: ['prod'],        description: 'SMTP password',                        sensitive: true },
  { name: 'EMAIL_FROM',        required: ['prod'],        description: 'Sender email address' },

  // CORS
  { name: 'CORS_ORIGIN',       required: ['prod'],        description: 'Allowed CORS origins',                 validate: (v) => v !== '*' || process.env.NODE_ENV !== 'production' },

  // Security
  { name: 'BCRYPT_ROUNDS',     required: [],              description: 'bcrypt hash rounds',                   validate: (v) => !isNaN(v) && +v >= 10 && +v <= 14 },
];

// ── Argument Parsing ──────────────────────────────────────

const args = process.argv.slice(2);
const envFlag = args.indexOf('--env');
const targetEnv = envFlag >= 0 ? args[envFlag + 1] : 'dev';

if (!['dev', 'prod'].includes(targetEnv)) {
  console.error(` Unknown environment: ${targetEnv}. Use --env dev or --env prod`);
  process.exit(1);
}

// ── Resolve dotenv from backend/node_modules ──────────────

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');

let dotenv;
try {
  // Try loading dotenv from backend's node_modules
  dotenv = require(path.join(backendDir, 'node_modules', 'dotenv'));
} catch (e) {
  try {
    dotenv = require('dotenv');
  } catch (e2) {
    console.warn(`  dotenv not found. Install it via: cd backend && npm ci`);
    console.warn(`    Continuing with process environment only.\n`);
    dotenv = null;
  }
}

// ── Load .env if present ──────────────────────────────────

const envFile = targetEnv === 'prod' ? '.env.production' : '.env';

// Search in cwd first, then backend directory
const candidates = [
  path.resolve(process.cwd(), envFile),
  path.resolve(backendDir, envFile),
  path.resolve(process.cwd(), '.env'),
  path.resolve(backendDir, '.env'),
];

let loaded = false;
if (dotenv) {
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(` Loaded env file: ${path.relative(rootDir, envPath)}`);
      loaded = true;
      break;
    }
  }
}

if (!loaded) {
  console.warn(`  No env file found. Validating process environment only.`);
}

// ── Validation ────────────────────────────────────────────

console.log(`\n Validating environment for: ${targetEnv.toUpperCase()}\n`);

const errors = [];
const warnings = [];
let sensitiveCount = 0;

for (const entry of ENV_SCHEMA) {
  const value = process.env[entry.name];
  const isRequired = entry.required.includes(targetEnv);

  if (isRequired && (!value || value.trim() === '')) {
    errors.push(`   ${entry.name} — MISSING (required for ${targetEnv}) — ${entry.description}`);
    continue;
  }

  if (!value || value.trim() === '') {
    // Optional and not set — fine
    continue;
  }

  // Check for placeholder values in production
  if (targetEnv === 'prod' && entry.sensitive) {
    const placeholders = ['change_me', 'your_', 'admin123', 'password', 'secret_here', 'xxx'];
    const lowerVal = value.toLowerCase();
    if (placeholders.some(ph => lowerVal.includes(ph))) {
      errors.push(`   ${entry.name} — contains placeholder value (unsafe for production)`);
      continue;
    }
    sensitiveCount++;
  }

  // Run custom validator if defined
  if (entry.validate && !entry.validate(value)) {
    errors.push(`   ${entry.name} — invalid value — ${entry.description}`);
  }
}

// Production-specific checks
if (targetEnv === 'prod') {
  // JWT_SECRET and JWT_REFRESH_SECRET must be different
  if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      errors.push(`   JWT_SECRET and JWT_REFRESH_SECRET must be different`);
    }
  }

  // CORS must not be wildcard in production
  if (process.env.CORS_ORIGIN === '*') {
    errors.push(`   CORS_ORIGIN must not be '*' in production`);
  }

  // Hash chain must be enabled
  if (process.env.ENABLE_HASH_CHAIN !== 'true') {
    warnings.push(`    ENABLE_HASH_CHAIN should be 'true' in production for audit integrity`);
  }

  // Auto logout should be enabled
  if (process.env.AUTO_LOGOUT_ENABLED !== 'true') {
    warnings.push(`    AUTO_LOGOUT_ENABLED should be 'true' in production`);
  }

  // Rate limiting should be restrictive
  const maxReq = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  if (maxReq > 200) {
    warnings.push(`    RATE_LIMIT_MAX_REQUESTS is ${maxReq} — consider lower value (<=200) for production`);
  }
}

// ── Report ────────────────────────────────────────────────

if (warnings.length > 0) {
  console.log(`  Warnings (${warnings.length}):`);
  warnings.forEach(w => console.log(w));
  console.log('');
}

if (errors.length > 0) {
  console.log(` Validation FAILED (${errors.length} error(s)):`);
  errors.forEach(e => console.log(e));
  console.log('');
  process.exit(1);
} else {
  console.log(` Environment validation PASSED for ${targetEnv.toUpperCase()}`);
  if (sensitiveCount > 0) {
    console.log(`    ${sensitiveCount} sensitive variable(s) verified (non-placeholder)`);
  }
  console.log('');
  process.exit(0);
}
