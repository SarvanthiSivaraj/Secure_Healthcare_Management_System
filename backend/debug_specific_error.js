const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSpecific() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@healthcare.com',
            password: 'Admin@123'
        });
        const token = loginRes.data.data.accessToken;

        // 2. Invite User (Specific Email)
        const email = 'test1234@gmail.com';
        console.log(`Inviting ${email} (Expect 500?)...`);

        try {
            await axios.post(`${API_URL}/staff/invite`,
                { email, role: 'nurse', invitationMessage: 'Msg', organizationId: '' }, // sending empty string like frontend
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Success (Unexpected?)');
        } catch (err) {
            console.log('Result:', err.response?.status, err.response?.data);
        }

    } catch (err) {
        console.error('Fatal Error:', err.message);
    }
}

testSpecific();
