/**
 * Jest globalTeardown – runs once after all integration test suites.
 * Closes the DB pool.
 */
'use strict';

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

module.exports = async function globalTeardown() {
    // No-op: individual test files manage their own pool via testUtils.
    // Pool is closed after each suite.
    console.log('\n🧹 Global teardown complete.\n');
};
