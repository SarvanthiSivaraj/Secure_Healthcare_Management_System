const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testInvite() {
    try {
        // 1. Login
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@healthcare.com',
            password: 'Admin@123'
        });

        const token = loginRes.data.data.accessToken;
        console.log('Login successful. Token obtained.');

        // 2. Try Invite
        const uniqueEmail = `test.nurse.${Date.now()}@healthcare.com`;
        console.log(`Attempting to invite staff: ${uniqueEmail}`);
        try {
            const inviteRes = await axios.post(
                `${API_URL}/staff/invite`,
                {
                    email: uniqueEmail,
                    role: 'nurse',
                    invitationMessage: 'Welcome to the team!'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log('✅ Invitation SUCCESS:', inviteRes.data);
        } catch (err) {
            console.log('❌ Invitation FAILED:', err.response?.data || err.message);
            if (err.response?.status === 403) {
                console.log('Got 403 Forbidden. RBAC fix failed?');
            }
        }

    } catch (err) {
        console.error('Login Failed:', err.response?.data || err.message);
    }
}

testInvite();
