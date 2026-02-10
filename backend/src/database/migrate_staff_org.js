const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

async function runMigration() {
    const client = new Client({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations/add_org_to_invitations.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Successfully added organization_id to staff_invitations');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
