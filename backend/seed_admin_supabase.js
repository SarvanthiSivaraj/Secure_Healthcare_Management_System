require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') ? { rejectUnauthorized: false } : false,
});

async function seedAdmin() {
    try {
        console.log('--- Seeding Admin to Supabase ---');

        // 1. Get system_admin role ID
        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'system_admin'");
        if (roleRes.rows.length === 0) {
            console.log('Role system_admin not found. Please check roles table.');
            return;
        }
        const roleId = roleRes.rows[0].id;

        // 2. Hash password
        const passwordHash = await bcrypt.hash('Admin@123', 12);
        const email = 'admin@healthcare.com';

        // 3. Insert or update admin user
        const userRes = await pool.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                status = 'active',
                is_verified = true
            RETURNING id
        `, [email, passwordHash, 'System', 'Admin', roleId, true, 'active']);

        console.log(`✅ Admin user seeded: ${email} (ID: ${userRes.rows[0].id})`);
        console.log('Password: Admin@123');

    } catch (err) {
        console.error('Seed failed:', err.message);
    } finally {
        await pool.end();
    }
}

seedAdmin();
