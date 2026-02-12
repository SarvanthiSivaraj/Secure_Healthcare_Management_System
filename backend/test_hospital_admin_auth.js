const axios = require('axios');

const testHospitalAdminAccess = async () => {
    try {
        console.log('🧪 Testing Hospital Admin Access...\n');

        // Step 1: Login as hospital admin
        console.log('1️⃣ Logging in as hospital admin...');
        const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
            email: 'admin@hospital.com',
            password: 'HospitalAdmin@123'
        });

        console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));

        const token = loginResponse.data.data?.token || loginResponse.data.token;
        const user = loginResponse.data.data?.user || loginResponse.data.user;

        if (!token) {
            throw new Error('No token in response');
        }

        console.log('✅ Login successful');
        console.log(`   User: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.roleName}`);
        console.log(`   Token: ${token.substring(0, 20)}...`);

        // Step 2: Test visit management access
        console.log('\n2️⃣ Testing /api/v1/visits/hospital endpoint...');
        const visitsResponse = await axios.get('http://localhost:5005/api/v1/visits/hospital', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Visit management access granted!');
        console.log(`   Found ${visitsResponse.data.data?.length || 0} visits`);

        // Step 3: Test approve visit endpoint
        console.log('\n3️⃣ Testing authorization for approve endpoint...');
        try {
            await axios.post('http://localhost:5005/api/v1/visits/test-id/approve', {
                doctorId: 'test-doctor-id'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Authorization passed (404 is expected for non-existent visit)');
            } else if (error.response?.status === 403) {
                console.log('❌ AUTHORIZATION FAILED - 403 Forbidden');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log(`⚠️  Got ${error.response?.status}: ${error.response?.data?.message}`);
            }
        }

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('\n❌ Test failed:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${error.response.data?.message || error.response.statusText}`);
            console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('   No response received from server');
            console.error('   Is the backend running on http://localhost:5000?');
        } else {
            console.error(`   Error: ${error.message}`);
        }

        if (error.response?.status === 403) {
            console.error('\n🔍 Authorization Issue Detected:');
            console.error('   The hospital_admin role is not authorized for this endpoint');
            console.error('   Check backend/src/modules/visit/visit.routes.js');
        }
    }
};

testHospitalAdminAccess();
