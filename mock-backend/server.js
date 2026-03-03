const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5003;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    credentials: true,
}));
app.use(express.json());

// --- Mock Data ---
const MOCK_USER = {
    id: "a1dadc55-3fb1-4082-a04d-00a6d1ff9349",
    email: "patient@medicare.com",
    role: "PATIENT",
    firstName: "John",
    lastName: "Doe"
};

const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImExZGFkYzU1LTNmYjEtNDA4Mi1hMDRkLTAwYTZkMWZmOTM0OSIsImVtYWlsIjoicGF0aWVudEBtZWRpY2FyZS5jb20iLCJyb2xlIjoiUEFUSUVOVCIsImlhdCI6MTYxNjQxNDU1NCwiZXhwIjoxNjE2NTAwOTU0fQ.mock_signature_here";

// --- Endpoints ---

// 1. Health Check
app.get('/health', (req, res) => {
    res.json({
        status: "UP",
        database: "MOCKED",
        version: "1.0.0-mock"
    });
});

// 2. Public Stats
app.get('/public/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            hospitalsCount: 42,
            patientsManaged: 15420
        }
    });
});

// 3. Register Patient
app.post('/api/v1/auth/register/patient', (req, res) => {
    const { email } = req.body;
    // Simulate sending an OTP
    res.json({
        success: true,
        message: `OTP sent to ${email}`
    });
});

// 4. Verify OTP
app.post('/api/v1/auth/otp/verify', (req, res) => {
    // Just accept any OTP
    res.json({
        success: true,
        message: 'OTP verified successfully'
    });
});

// 5. Login
app.post('/api/v1/auth/login', (req, res) => {
    const { emailOrPhone, password } = req.body;
    
    // Accept any password for mock user
    if (emailOrPhone === 'patient@medicare.com' || emailOrPhone === 'test@test.com') {
        return res.json({
            success: true,
            data: {
                user: { ...MOCK_USER, email: emailOrPhone },
                accessToken: MOCK_TOKEN
            }
        });
    }

    // Default generic success for testing
    return res.json({
        success: true,
        data: {
            user: { ...MOCK_USER, email: emailOrPhone },
            accessToken: MOCK_TOKEN
        }
    });
});

// 6. Passkey Login Options
app.post('/api/v1/auth/passkey/login/options', (req, res) => {
    const { email } = req.body;
    
    // Return mock SimpleWebAuthn options
    res.json({
        success: true,
        data: {
            challenge: "mock-options-challenge-string",
            timeout: 60000,
            rpId: "localhost",
            allowCredentials: [],
            userVerification: "preferred"
        }
    });
});

// 7. Passkey Login Verify
app.post('/api/v1/auth/passkey/login/verify', (req, res) => {
    const { email, credential } = req.body;

    // Just accept any credential for the mock
    res.json({
        success: true,
        data: {
            user: { ...MOCK_USER, email: email },
            accessToken: MOCK_TOKEN
        }
    });
});

// 8. Verify Session (Mock endpoint for frontend startup)
app.get('/api/v1/auth/verify', (req, res) => {
    // If authorization header exists, verify success
    if (req.headers.authorization) {
        return res.json({
            success: true,
            data: {
                user: MOCK_USER
            }
        });
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
});

app.get('/api/v1/visits/hospital', (req, res) => {
    res.json({ success: true, data: [] });
});

app.get('/api/v1/visits/my-visits', (req, res) => {
    // Return some mock visits to show in Visits.jsx
    res.json({
        success: true,
        data: [
            {
                id: 'visit-1',
                visit_code: '123456',
                organization_name: 'Medicare General Hospital',
                doctor_first_name: 'Sarah',
                doctor_last_name: 'Smith',
                reason: 'Regular Checkup',
                scheduled_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                status: 'scheduled'
            },
            {
                id: 'visit-2',
                visit_code: '789012',
                organization_name: 'Medicare General Hospital',
                doctor_first_name: 'John',
                doctor_last_name: 'Doe',
                reason: 'Follow-up',
                scheduled_time: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
                status: 'completed'
            }
        ]
    });
});

app.post('/api/v1/visits/request', (req, res) => {
    // Basic verification without real auth logic for the mock
    res.json({
        success: true,
        data: MOCK_USER
    });
});

app.post('/api/v1/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

// ── User Profile ──
app.get('/api/v1/users/profile', (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: MOCK_USER.id,
                firstName: MOCK_USER.firstName,
                lastName: MOCK_USER.lastName,
                email: MOCK_USER.email,
                phone: '+1 234 567 890',
                role: MOCK_USER.role,
                status: 'active'
            }
        }
    });
});

app.put('/api/v1/users/profile', (req, res) => {
    const { firstName, lastName, phone } = req.body;
    res.json({
        success: true,
        data: {
            id: MOCK_USER.id,
            firstName: firstName || MOCK_USER.firstName,
            lastName: lastName || MOCK_USER.lastName,
            email: MOCK_USER.email,
            phone: phone || '+1 234 567 890'
        }
    });
});

// ── Consent ──
const MOCK_CONSENTS = [
    {
        id: 'consent-1',
        hospitalId: 'hosp-123',
        hospitalName: 'Medicare General Hospital',
        doctorName: 'Dr. Sarah Smith',
        grantedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: 'active',
        permissions: [
            { recordType: 'Consultation', accessLevel: 'read' },
            { recordType: 'Lab Results', accessLevel: 'read & write' }
        ]
    }
];

app.get('/api/v1/consent/active', (req, res) => {
    res.json(MOCK_CONSENTS.filter(c => c.status === 'active'));
});

app.get('/api/v1/consent/history', (req, res) => {
    res.json([
        {
            id: 'consent-old-1',
            hospitalName: 'City Clinic',
            doctorName: 'Dr. James Lee',
            grantedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            expiresAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            status: 'expired',
            permissions: [{ recordType: 'Prescription', accessLevel: 'read' }]
        }
    ]);
});

app.post('/api/v1/consent/grant', (req, res) => {
    const { hospitalId, hospitalName, durationHours, durationMinutes, permissions } = req.body;
    const newConsent = {
        id: `consent-${Date.now()}`,
        hospitalId,
        hospitalName,
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (durationHours * 3600 + (durationMinutes || 0) * 60) * 1000).toISOString(),
        status: 'active',
        permissions
    };
    MOCK_CONSENTS.push(newConsent);
    res.json({ success: true, data: newConsent });
});

app.put('/api/v1/consent/:consentId', (req, res) => {
    res.json({ success: true, message: 'Consent updated' });
});

app.put('/api/v1/consent/revoke/:consentId', (req, res) => {
    const idx = MOCK_CONSENTS.findIndex(c => c.id === req.params.consentId);
    if (idx !== -1) MOCK_CONSENTS[idx].status = 'revoked';
    res.json({ success: true, message: 'Consent revoked' });
});

// ── Medical Records ──
app.get('/api/v1/emr/patients/:patientId/medical-records', (req, res) => {
    res.json({
        success: true,
        data: {
            records: [
                {
                    id: 'rec-1',
                    type: 'consultation',
                    title: 'Annual Physical Examination',
                    description: 'Patient is in good overall health. Blood pressure and heart rate within normal range. Recommended continued exercise and balanced diet.',
                    created_by_name: 'Dr. Sarah Smith',
                    created_by_role: 'DOCTOR',
                    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
                },
                {
                    id: 'rec-2',
                    type: 'lab_result',
                    title: 'Complete Blood Count (CBC)',
                    description: 'All values within normal range. WBC: 6.5, RBC: 4.9, Hemoglobin: 14.2 g/dL. No abnormalities detected.',
                    created_by_name: 'Lab Tech - Medicare Lab',
                    created_by_role: 'LAB_TECH',
                    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
                },
                {
                    id: 'rec-3',
                    type: 'prescription',
                    title: 'Vitamin D3 Supplementation',
                    description: 'Vitamin D3 60,000 IU once weekly for 8 weeks. Recheck levels after course completion.',
                    created_by_name: 'Dr. Sarah Smith',
                    created_by_role: 'DOCTOR',
                    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
                },
                {
                    id: 'rec-4',
                    type: 'diagnosis',
                    title: 'Mild Vitamin D Deficiency',
                    description: 'Serum Vitamin D level at 18 ng/mL. Below optimal range of 30-100 ng/mL. Supplementation prescribed.',
                    created_by_name: 'Dr. Sarah Smith',
                    created_by_role: 'DOCTOR',
                    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
                },
                {
                    id: 'rec-5',
                    type: 'note',
                    title: 'Follow-up Reminder',
                    description: 'Patient advised to return for follow-up in 8 weeks. Check Vitamin D levels and reassess diet.',
                    created_by_name: 'Dr. John Doe',
                    created_by_role: 'DOCTOR',
                    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
                }
            ]
        }
    });
});

// ── Visit Check-In ──
app.post('/api/v1/visits/check-in', (req, res) => {
    const { visitCode } = req.body;
    if (!visitCode) return res.status(400).json({ success: false, message: 'Visit code is required' });
    res.json({
        success: true,
        data: {
            visitId: `visit-checkin-${Date.now()}`,
            visitCode,
            status: 'checked_in',
            hospitalName: 'Medicare General Hospital',
            message: 'Successfully checked in'
        }
    });
});



// ── Audit Trail ──
app.get('/api/v1/audit/my-trail', (req, res) => {
    res.json({
        success: true,
        data: {
            logs: [
                {
                    id: 'log-1',
                    action: 'consent_grant',
                    userFirstName: 'Sarah',
                    userLastName: 'Smith',
                    userEmail: 'dr.sarah@medicare.com',
                    userRole: 'DOCTOR',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    purpose: 'Pre-surgery consultation access'
                },
                {
                    id: 'log-2',
                    action: 'view_patient_records',
                    userFirstName: 'John',
                    userLastName: 'Doe',
                    userEmail: 'dr.john@medicare.com',
                    userRole: 'DOCTOR',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    purpose: 'Follow-up appointment review'
                },
                {
                    id: 'log-3',
                    action: 'user_login',
                    userFirstName: 'You',
                    userLastName: '',
                    userEmail: 'patient@medicare.com',
                    userRole: 'PATIENT',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    purpose: null
                },
                {
                    id: 'log-4',
                    action: 'consent_revoke',
                    userFirstName: 'Admin',
                    userLastName: 'User',
                    userEmail: 'admin@medicare.com',
                    userRole: 'ADMIN',
                    timestamp: new Date(Date.now() - 172800000).toISOString(),
                    purpose: 'Access expired per policy'
                }
            ],
            pagination: { total: 4, pages: 1, limit: 50, offset: 0 }
        }
    });
});


// 9. Patient Profile
app.get('/api/v1/patient/profile', (req, res) => {
    // Basic verification without real auth logic for the mock
    res.json({
        success: true,
        data: MOCK_USER
    });
});

// 10. Patient Health Facts (Replaces Stats & Insights)
app.get('/api/v1/patient/health-facts', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                title: "Vital Monitoring",
                description: "Stable heart rate and blood pressure recorded last 24h."
            },
            {
                title: "Calorie Intake",
                description: "Nutritional goals are 85% met for this week's plan."
            },
            {
                title: "Sleep Pattern",
                description: "Average 7.5 hours of deep sleep. Recovery is optimal."
            }
        ]
    });
});

// 11. Patient Activities 
app.get('/api/v1/patient/activities', (req, res) => {
    // Returning dummy activity history, ordered by date descending (most recent first)
    res.json({
        success: true,
        data: [
            {
                id: "act-1",
                type: "Diagnosis",
                title: "Stable Recovery (Post-Op)",
                date: "2025-10-12T10:00:00Z",
                colorClass: "bg-indigo-500",
                borderColorClass: "border-indigo-500/30"
            },
            {
                id: "act-2",
                type: "Medication",
                title: "Amoxicillin 500mg (2x/day)",
                date: "2025-10-11T14:30:00Z",
                colorClass: "bg-indigo-400",
                borderColorClass: "border-indigo-500/30"
            },
            {
                id: "act-3",
                type: "Lab Results",
                title: "WBC - Normal Range",
                date: "2025-09-06T09:15:00Z",
                colorClass: "bg-teal-400",
                borderColorClass: "border-indigo-500/30"
            },
            {
                id: "act-4",
                type: "Hospital Visit",
                title: "Routine Checkup - General Med",
                date: "2025-09-01T11:00:00Z",
                colorClass: "bg-amber-500",
                borderColorClass: "border-indigo-500/30"
            },
            {
                id: "act-5",
                type: "Prescription",
                title: "Vitamin D3 60K IU (Weekly)",
                date: "2025-08-15T16:45:00Z",
                colorClass: "bg-indigo-400",
                borderColorClass: "border-indigo-500/30"
            }
        ]
    });
});

// --- Catch all for unhandled routes ---
app.use((req, res) => {
    console.log(`[MOCK] Unhandled route accessed: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: 'Mock endpoint not found' });
});

// Start mock server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 MOCK Backend running on http://localhost:${PORT}`);
    console.log(`===============================================`);
    console.log(`Mocking endpoints for Frontend Port 3000`);
});
