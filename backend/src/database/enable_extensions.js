const { Pool } = require('pg');
const config = require('../config/env');
const logger = require('../utils/logger');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const fixExtensions = async () => {
    try {
        logger.info('🔧 Enabling required database extensions...');
        
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        
        logger.info('✅ Extension "pgcrypto" enabled successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Failed to enable extension:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    fixExtensions();
}

module.exports = { fixExtensions };
