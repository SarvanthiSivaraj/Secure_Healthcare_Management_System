/**
 * Loads .env.test before integration tests run.
 * Jest setupFiles runs in the test process before each test file.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.test') });
