const axios = require('axios');
const API_URL = 'http://localhost:5004/api';

async function testVisitFlow() {
    try {
        console.log('--- 1. Login as Patient ---');
        const patientRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'patient@example.com',
            password: 'Patient@123'
        });
        const patientToken = patientRes.data.token;
        console.log('✅ Patient logged in');

        console.log('\n--- 2. Request Visit (Code: 100001) ---');
        try {
            const visitRes = await axios.post(
                `${API_URL}/visits/request`,
                {
                    hospitalCode: '100001',
                    reason: 'Severe headache and fever',
                    symptoms: 'Headache, Fever, Nausea'
                },
                { headers: { Authorization: `Bearer ${patientToken}` } }
            );
            console.log('✅ Visit requested:', visitRes.data.data.id);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                console.log('⚠️ Active visit already exists (Expected if re-running)');
            } else {
                throw err;
            }
        }

        console.log('\n--- 3. Login as Hospital Admin ---');
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'hosp_admin@healthcare.com',
            password: 'Admin@123'
        });
        const adminToken = adminRes.data.token;
        console.log('✅ Admin logged in');

        console.log('\n--- 4. Get Hospital Visits ---');
        const listRes = await axios.get(
            `${API_URL}/visits/hospital?status=pending`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.table(listRes.data.data.map(v => ({
            id: v.id,
            patient: `${v.patient_first_name} ${v.patient_last_name}`,
            reason: v.reason,
            status: v.status,
            created: v.created_at
        })));
        console.log(`✅ Found ${listRes.data.data.length} pending visits`);

    } catch (err) {
        console.error('❌ Error:', err.response ? err.response.data : err.message);
    }
}

testVisitFlow();
