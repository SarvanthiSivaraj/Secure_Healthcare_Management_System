const { Client } = require('pg');

async function testConnection(port) {
    const client = new Client({
        host: 'aws-1-ap-northeast-1.pooler.supabase.com',
        port: port,
        database: 'postgres',
        user: 'postgres.dfahfdiuhwjyckdziyxo',
        password: 'Bfbubb3amGy3HQ91',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
    });

    try {
        await client.connect();
        console.log(`Successfully connected to port ${port}`);
        await client.end();
    } catch (err) {
        console.error(`Failed to connect to port ${port}:`, err.message);
    }
}

async function run() {
    await testConnection(5432);
    await testConnection(6543);
    await testConnection(443);
}

run();
