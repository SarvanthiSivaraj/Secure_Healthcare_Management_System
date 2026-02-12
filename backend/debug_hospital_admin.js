// Debug script to check what's happening with hospital admin login
const axios = require('axios');

const debugHospitalAdmin = async () => {
    try {
        console.log('🔍 Debugging Hospital Admin Access...\n');

        // Step 1: Login
        console.log('1️⃣ Logging in as hospital admin...');
        const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
            emailOrPhone: 'admin@hospital.com',
            password: 'HospitalAdmin@123'
        });

        console.log('\n📦 Login Response:');
        console.log(JSON.stringify(loginResponse.data, null, 2));

        const user = loginResponse.data.user || loginResponse.data.data?.user;
        const token = loginResponse.data.accessToken || loginResponse.data.data?.accessToken;

        console.log('\n👤 User Info:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   First Name: ${user.firstName}`);
        console.log(`   Last Name: ${user.lastName}`);

        console.log('\n🔑 Token (first 50 chars):');
        console.log(`   ${token.substring(0, 50)}...`);

        // Decode JWT to see payload
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('\n🔓 JWT Payload:');
        console.log(JSON.stringify(payload, null, 2));

        // Step 2: Test visit endpoint
        console.log('\n2️⃣ Testing /api/v1/visits/hospital...');
        try {
            const visitsResponse = await axios.get('http://localhost:5005/api/v1/visits/hospital', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Success! Status:', visitsResponse.status);
            console.log('   Visits found:', visitsResponse.data.data?.length || 0);
        } catch (error) {
            console.log('❌ Failed! Status:', error.response?.status);
            console.log('   Error:', error.response?.data?.message);
            console.log('   Full response:', JSON.stringify(error.response?.data, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
};

debugHospitalAdmin();
