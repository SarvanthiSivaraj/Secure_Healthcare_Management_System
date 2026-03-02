const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.dfahfdiuhwjyckdziyxo:Bfbubb3amGy3HQ91@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres' });
async function run() {
    try {
        console.log("Dropping old constraint...");
        await pool.query("ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_status_check;");

        console.log("Adding new constraint to support pending and approved...");
        await pool.query("ALTER TABLE visits ADD CONSTRAINT visits_status_check CHECK (status IN ('pending', 'approved', 'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'));");

        console.log("SUCCESS!");
    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        process.exit(0);
    }
}
run();
