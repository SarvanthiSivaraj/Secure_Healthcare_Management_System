const axios = require('axios');

const testApproveVisit = async () => {
    try {
        console.log('🧪 Testing Visit Approval...\n');

        // Step 1: Login as hospital admin
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
            emailOrPhone: 'admin@hospital.com',
            password: 'HospitalAdmin@123'
        });

        const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
        console.log('✅ Login successful\n');

        // Step 2: Get pending visits
        console.log('2️⃣ Getting pending visits...');
        const visitsResponse = await axios.get('http://localhost:5005/api/v1/visits/hospital?status=pending', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const visits = visitsResponse.data.data || visitsResponse.data;
        console.log(`✅ Found ${visits.length} pending visit(s)\n`);

        if (visits.length === 0) {
            console.log('⚠️  No pending visits to approve');
            return;
        }

        const visitToApprove = visits[0];
        console.log('📋 Visit to approve:');
        console.log(`   ID: ${visitToApprove.id}`);
        console.log(`   Patient: ${visitToApprove.patient_name || visitToApprove.patient_id}`);
        console.log(`   Reason: ${visitToApprove.reason}\n`);

        // Step 3: Try to approve the visit
        console.log('3️⃣ Approving visit...');
        try {
            const approveResponse = await axios.post(
                `http://localhost:5005/api/v1/visits/${visitToApprove.id}/approve`,
                {
                    doctorId: '1',  // Test doctor ID
                    nurseId: '1'    // Test nurse ID
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            console.log('✅ Visit approved successfully!');
            console.log('Response:', JSON.stringify(approveResponse.data, null, 2));

        } catch (approveError) {
            console.error('\n❌ Approve failed!');
            console.error('Status:', approveError.response?.status);
            console.error('Error:', JSON.stringify(approveError.response?.data, null, 2));

            // Log the full error for debugging
            if (approveError.response?.data?.error) {
                console.error('\nDetailed error:', approveError.response.data.error);
            }
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

testApproveVisit();
