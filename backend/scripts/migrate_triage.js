const { Pool } = require('pg');
const config = require('../src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const createTriageTableQuery = `
-- ============================================
-- TRIAGE_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS triage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    conversation JSONB DEFAULT '[]'::jsonb,
    soap_summary JSONB,
    recommended_department VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'normal',
    confidence_score DECIMAL(3, 2),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_triage_sessions_patient ON triage_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_created_at ON triage_sessions(created_at DESC);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_triage_sessions_updated_at ON triage_sessions;
CREATE TRIGGER update_triage_sessions_updated_at BEFORE UPDATE ON triage_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

const applyTriageSchema = async () => {
    try {
        console.log('Applying triage_sessions schema update...');
        await pool.query(createTriageTableQuery);
        console.log('✅ triage_sessions table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to apply triage schema update:', error);
        process.exit(1);
    }
};

applyTriageSchema();
