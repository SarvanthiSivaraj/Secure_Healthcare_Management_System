const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testOnboarding() {
    try {
        // 1. Login
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@healthcare.com',
            password: 'Admin@123'
        });

        const token = loginRes.data.data.accessToken;
        console.log('Login successful. Token obtained.');

        // 2. Try Onboarding
        console.log('Attempting to onboard staff...');
        try {
            const onboardRes = await axios.post(
                `${API_URL}/users/staff/onboard`,
                {
                    email: 'test.nurse@healthcare.com',
                    roleName: 'nurse',
                    // organizationId is optional now
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log('✅ Onboarding SUCCESS:', onboardRes.data);
        } catch (err) {
            console.log('❌ Onboarding FAILED:', err.response?.data || err.message);
            if (err.response?.status === 403) {
                console.log('Got 403 Forbidden. Check server logs for RBAC debug info.');
            }
        }

    } catch (err) {
        console.error('Login Failed:', err.response?.data || err.message);
    }
}

testOnboarding();
