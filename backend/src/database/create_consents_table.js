const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const createConsentsTable = async () => {
    try {
        console.log('Creating consents table...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS consents (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                data_category VARCHAR(50) NOT NULL, 
                purpose VARCHAR(255) NOT NULL,
                access_level VARCHAR(20) NOT NULL DEFAULT 'read' CHECK (access_level IN ('read', 'write')),
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_consents_patient ON consents(patient_id);
            CREATE INDEX IF NOT EXISTS idx_consents_recipient ON consents(recipient_user_id);
            CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);
        `;

        await pool.query(createTableQuery);
        
        // Also add the trigger for updated_at
        await pool.query(`
            DROP TRIGGER IF EXISTS update_consents_updated_at ON consents;
            CREATE TRIGGER update_consents_updated_at BEFORE UPDATE ON consents
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('✅ Consents table created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        pool.end();
    }
};

createConsentsTable();
