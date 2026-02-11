const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDuplicate() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@healthcare.com',
            password: 'Admin@123'
        });
        const token = loginRes.data.data.accessToken;

        // 2. Invite User (First time) - Should succeed or fail if exists
        const email = 'duplicate.test@gmail.com';
        console.log(`Inviting ${email} (Attempt 1)...`);

        try {
            await axios.post(`${API_URL}/staff/invite`,
                { email, role: 'nurse', invitationMessage: 'Msg' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Attempt 1: Success');
        } catch (err) {
            console.log('Attempt 1 Result:', err.response?.status, err.response?.data);
        }

        // 3. Invite User (Second time) - Should be 409
        console.log(`Inviting ${email} (Attempt 2 - Expecting 409)...`);
        try {
            await axios.post(`${API_URL}/staff/invite`,
                { email, role: 'nurse', invitationMessage: 'Msg' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Attempt 2: Success (Unexpected!)');
        } catch (err) {
            console.log('Attempt 2 Result:', err.response?.status, err.response?.data);
        }

    } catch (err) {
        console.error('Fatal Error:', err.message);
    }
}

testDuplicate();
