const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration from environment variables
const isSupabase = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
});

// Force UTC for timestamp parsing to avoid local timezone conversions
// 1114 is timestamp without time zone, 1184 is timestamp with time zone
const types = require('pg').types;
const parseFn = (val) => val; // Return raw string, let JS Date handle it as UTC if it has Z
types.setTypeParser(1114, parseFn);
types.setTypeParser(1184, parseFn);

// Test database connection
pool.on('connect', () => {
    logger.info('Database connection established');
});

pool.on('error', (err) => {
    logger.error('Unexpected database error:', err);
    // Temporarily commented out to prevent silent crashes during debugging
    // process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        logger.error('Database query error:', { text, error: error.message });
        throw error;
    }
};

// Helper function for transactions
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Test connection function
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW()');
        logger.info('Database connection test successful:', result.rows[0]);
        return true;
    } catch (error) {
        logger.error('Database connection test failed:', error);
        return false;
    }
};

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
};
