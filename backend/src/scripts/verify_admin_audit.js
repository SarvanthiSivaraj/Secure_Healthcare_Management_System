const http = require('http');

console.log('--- VERIFY ADMIN AUDIT ---');

// 1. Login as Admin
const loginData = JSON.stringify({
    email: 'admin@healthcare.com',
    password: 'Admin@123'
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
            console.error('Admin Login Failed:', data);
            return;
        }
        const token = JSON.parse(data).data.accessToken;
        console.log('Admin Login Successful');

        // 2. Fetch All Audit Logs
        fetchAuditLogs(token);
    });
});
loginReq.write(loginData);
loginReq.end();

function fetchAuditLogs(token) {
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/audit/logs',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log('Fetch Audit Logs Status:', res.statusCode);
            if (res.statusCode === 200) {
                const response = JSON.parse(data);
                if (response.success) {
                    console.log('SUCCESS: Admin can fetch audit logs.');
                    console.log('Total Logs:', response.pagination.total);
                    console.log('Recent Actions:', response.data.map(l => l.action));
                } else {
                    console.log('FAILURE: API returned success: false', response);
                }
            } else {
                console.log('FAILURE: Failed to fetch audit logs:', data);
            }
        });
    });
    req.end();
}
