const http = require('http');

const loginData = JSON.stringify({
    email: 'patient@example.com', // Using the patient email from logs/db
    password: 'Patient@123'    // Using the password from logs/seed
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Login Successful!');
            const response = JSON.parse(data);
            const token = response.data.accessToken;

            // Now call Audit Trail
            callAuditTrail(token);
        } else {
            console.error('Login Failed:', res.statusCode, data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with login request: ${e.message}`);
});

req.write(loginData);
req.end();

function callAuditTrail(token) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/audit/my-trail',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Audit API Status Code:', res.statusCode);
            if (res.statusCode === 200) {
                console.log('Audit API SUCCESS!');
                const result = JSON.parse(data);
                console.log('Logs count:', result.data.logs.length);
            } else {
                console.error('Audit API Failed:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with audit request: ${e.message}`);
    });

    req.end();
}
