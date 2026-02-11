const http = require('http');

console.log('--- VERIFY VISIT AUDIT ---');

// 1. Login as Patient
const loginData = JSON.stringify({
    email: 'patient@example.com',
    password: 'Patient@123'
});

const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error('Login Failed:', data);
            return;
        }
        const token = JSON.parse(data).data.accessToken;
        console.log('Login Successful');

        // 2. Create Visit
        createVisit(token);
    });
});
loginReq.write(loginData);
loginReq.end();

function createVisit(token) {
    const visitData = JSON.stringify({
        hospitalCode: '100001', // Ensure this code exists in DB or use a known one
        reason: 'Audit Test',
        symptoms: 'Testing audit logs'
    });

    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/visits/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': visitData.length,
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log('Create Visit Status:', res.statusCode);
            console.log('Response:', data);

            // 3. Check Audit Logs (using the check_recent_logs.js script or similar logic)
            // For now, we'll just output a message to run the check script manually or automate it here if possible.
            // Let's automate by calling the check endpoint
            checkAuditTrail(token);
        });
    });
    req.write(visitData);
    req.end();
}

function checkAuditTrail(token) {
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/audit/my-trail?limit=5',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log('Audit Trail Status:', res.statusCode);
            if (res.statusCode === 200) {
                const logs = JSON.parse(data).data.logs;
                const found = logs.find(l => l.action === 'create_visit');
                if (found) {
                    console.log('SUCCESS: Found create_visit log!');
                    console.log(found);
                } else {
                    console.log('FAILURE: create_visit log NOT found in recent logs.');
                    console.log('Recent logs actions:', logs.map(l => l.action));
                }
            } else {
                console.log('Failed to fetch audit trail:', data);
            }
        });
    });
    req.end();
}
