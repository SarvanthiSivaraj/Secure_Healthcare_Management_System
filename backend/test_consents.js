const { query } = require('./src/config/db');
require('dotenv').config();

async function testConsentCheck() {
    try {
        // Query to show all consents
        const result = await query(`
            SELECT 
                c.id,
                c.patient_id,
                c.recipient_user_id,
                c.data_category,
                c.access_level,
                c.status,
                concat(p.first_name, ' ', p.last_name) as patient_name,
                concat(r.first_name, ' ', r.last_name) as recipient_name
            FROM consents c
            JOIN users p ON c.patient_id = p.id
            JOIN users r ON c.recipient_user_id = r.id
            WHERE c.status = 'active'
        `);

        console.log('\n=== Active Consents ===');
        result.rows.forEach(consent => {
            console.log(`
Patient: ${consent.patient_name} (${consent.patient_id})
Recipient: ${consent.recipient_name} (${consent.recipient_user_id})
Category: ${consent.data_category}
Access Level: ${consent.access_level}
Status: ${consent.status}
---`);
        });

        console.log(`\nTotal active consents: ${result.rows.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testConsentCheck();
