require('dotenv').config();

async function testVisits() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@healthcare.com',
                password: 'Admin@123'
            })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error('Login Failed:', loginData);
            return;
        }

        const token = loginData.data.accessToken;
        console.log('✅ Login successful. Token obtained.');

        console.log('\n2. Fetching Hospital Visits...');
        const visitRes = await fetch('http://localhost:5000/api/visits/hospital', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const visitData = await visitRes.json();

        if (!visitRes.ok) {
            console.error('❌ API Error:', visitRes.status, visitData);
        } else {
            console.log('✅ Success! Data:', visitData);
        }

    } catch (err) {
        console.error('❌ Test Failed:', err.message);
    }
}

testVisits();
