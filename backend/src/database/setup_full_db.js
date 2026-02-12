const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
};

const runQuery = async (client, query, description) => {
    console.log(`⏳ ${description}...`);
    try {
        await client.query(query);
        console.log(`✅ ${description} completed`);
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        throw error;
    }
};

const runFile = async (client, filePath, description) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    await runQuery(client, sql, description);
};

const ensureVisitCode = async (client) => {
    try {
        // Check if visits table exists
        const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visits')");
        if (res.rows[0].exists) {
            // Add visit_code if it doesn't exist
            await client.query("ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_code VARCHAR(20)");
            console.log("✅ Ensured 'visit_code' column exists in 'visits' table");
        }
    } catch (err) {
        console.warn("⚠️ Failed to ensure visit_code (non-fatal):", err.message);
    }
};

const ensureConsentsColumns = async (client) => {
    try {
        const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'consents')");
        if (res.rows[0].exists) {
            await client.query("ALTER TABLE consents ADD COLUMN IF NOT EXISTS recipient_organization_id UUID REFERENCES organizations(id)");
            await client.query("ALTER TABLE consents ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP");
            await client.query("ALTER TABLE consents ADD COLUMN IF NOT EXISTS revocation_reason TEXT");
            console.log("✅ Ensured columns exist in 'consents' table");
        }
    } catch (err) {
        console.warn("⚠️ Failed to ensure consents columns (non-fatal):", err.message);
    }
};

const setupFullDatabase = async () => {
    console.log('\n🚀 Starting Full Database Setup...\n');

    // Connect to specific database
    const client = new Client(config);

    try {
        await client.connect();
        console.log(`✅ Connected to database: ${config.database}`);

        // 1. Core Schema
        await runFile(client, path.join(__dirname, 'schema.sql'), 'Core Schema (Epic 1 & 2)');

        // 2. EMR Schema
        await runFile(client, path.join(__dirname, 'schema_emr.sql'), 'EMR Schema (Epic 3)');

        // 3. Staff Management Schema
        await runFile(client, path.join(__dirname, 'schema_staff_management.sql'), 'Staff Management Schema');

        // 4. Workflow Schema
        await runFile(client, path.join(__dirname, 'schema_workflow.sql'), 'Clinical Workflow Schema (Epic 4)');

        console.log('\n✨ All schemas applied successfully!');

        // 5. Seeds
        console.log('\n🌱 Starting Seeds...\n');

        // We can't easily require() the seed files because some might not export a function or might run immediately.
        // However, checking seed.js, it exports { seed } and runs if main. 
        // seed_doctors.js and others might be different. 
        // Let's safe-guard this by running them as child processes or if they are modules, importing them.

        // Let's try importing seed.js as it exports a seed function
        const { seed } = require('./seed');
        // We need to handle the fact that seed() might call process.exit()
        // For now, let's just run the seed logic ourselves or defer to the user to run seeds separate if they are complex.
        // But the requirement is "load all database".

        // Actually, looking at seed.js, it calls process.exit(0). This is bad for a unified script if we import it.
        // Better to run them as child processes to ensure isolation and prevent process.exit from killing this script.

    } catch (error) {
        console.error('\n❌ Database setup failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
};

// Helper to run external scripts if needed, but for now let's just do the schema.
// Users can run npm run db:seed afterwards, or we can instruct them.
// The user asked to "help me load all the database".
// Let's include the seed execution using child_process to be safe against process.exit in seeds.

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const runScript = async (scriptName) => {
    console.log(`\n▶️ Running script: ${scriptName}...`);
    try {
        const { stdout, stderr } = await execPromise(`node ${scriptName}`, { cwd: process.cwd() });
        console.log(stdout);
        if (stderr) console.error(stderr);
        console.log(`✅ ${scriptName} completed`);
    } catch (error) {
        console.error(`❌ ${scriptName} failed:`, error.message);
        throw error;
    }
};

const setupWithSeeds = async () => {
    // Connect to specific database
    const client = new Client(config);
    try {
        await client.connect();
        console.log(`✅ Connected to database: ${config.database}`);

        // 1. Core Schema
        await runFile(client, path.join(__dirname, 'schema.sql'), 'Core Schema (Epic 1 & 2)');

        // Fix: Ensure visit_code exists if visits table is already present (from partial migrations)
        await ensureVisitCode(client);
        await ensureConsentsColumns(client);

        // 2. EMR Schema
        await runFile(client, path.join(__dirname, 'schema_emr.sql'), 'EMR Schema (Epic 3)');

        // 3. Staff Management Schema
        await runFile(client, path.join(__dirname, 'schema_staff_management.sql'), 'Staff Management Schema');

        // 4. Workflow Schema
        await runFile(client, path.join(__dirname, 'schema_workflow.sql'), 'Clinical Workflow Schema (Epic 4)');

        // 5. Additional Migrations
        await runFile(client, path.join(__dirname, 'migrations/add_visit_management_fixed.sql'), 'Migration: Visit Management');
        await runFile(client, path.join(__dirname, 'migrations/add_visit_otp_access_level.sql'), 'Migration: Visit OTP & Access Level');
        await runFile(client, path.join(__dirname, 'migrations/add_medical_records_immutability.sql'), 'Migration: Medical Records Immutability');

        await client.end(); // Close connection before spawning seeds to avoid connection limit issues if seeds also connect

        console.log('\n✨ Schemas applied. Running seeds...');

        // Run seeds using child_process to handle self-contained scripts that might process.exit
        await runScript('src/database/seed.js');
        // Add other seeds if necessary, checking file existence
        if (fs.existsSync(path.join(__dirname, 'seed_doctors.js'))) {
            await runScript('src/database/seed_doctors.js');
        }

        if (fs.existsSync(path.join(__dirname, 'seed_mapping.js'))) {
            await runScript('src/database/seed_mapping.js');
        }

        console.log('\n🎉 Full Database Setup (Schema + Seeds) Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        // Ensure client is closed if error happened before close
        try { await client.end(); } catch (e) { }
        process.exit(1);
    }
}

if (require.main === module) {
    setupWithSeeds();
}

module.exports = { setupWithSeeds };
