const { Client } = require('pg');
const config = require('./src/config/env');

async function resetDb() {
    console.log("Resetting database schema public...");
    const client = new Client({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
    });

    try {
        await client.connect();
        await client.query('DROP SCHEMA public CASCADE;');
        await client.query('CREATE SCHEMA public;');
        await client.query('GRANT ALL ON SCHEMA public TO postgres;');
        await client.query('GRANT ALL ON SCHEMA public TO public;');
        console.log("Schema public has been reset.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

resetDb();
