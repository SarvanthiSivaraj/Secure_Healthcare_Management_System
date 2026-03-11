const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const logger = require('./utils/logger');
const { metricsMiddleware, trackConnections, metricsEndpoint } = require('./middleware/metrics');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const consentRoutes = require('./modules/consent/consent.routes');
const emrRoutes = require('./modules/emr/emr.routes');
const workflowRoutes = require('./modules/workflow/workflow.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const patientRoutes = require('./modules/patient/patient.routes');
const chatbotRoutes = require('./modules/chatbot/chatbot.routes');

// Phase 1: Staff Management routes
const staffRoutes = require('./modules/staff/staff.routes');
const nurseRoutes = require('./modules/nurse/nurse.routes');
const doctorVerificationRoutes = require('./modules/doctors/doctor.verification.routes');
const radiologyRoutes = require('./modules/radiology/radiology.routes');
const pharmacistRoutes = require('./modules/pharmacist/pharmacist.routes');
const insuranceRoutes = require('./modules/insurance/insurance.routes');
const complianceRoutes = require('./modules/compliance/compliance.routes');
const labRoutes = require('./modules/lab/lab.routes');



const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Monitoring middleware
app.use(trackConnections);
app.use(metricsMiddleware);

// Request logging middleware
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Healthcare API is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// API version prefix
const API_PREFIX = `/api/${config.apiVersion}`;

// Apply rate limiting to all API routes
app.use(API_PREFIX, apiLimiter);
app.use('/api', apiLimiter);

// Mount routes (Versioned)
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/nurse`, nurseRoutes);
app.use(`${API_PREFIX}/consent`, consentRoutes);
app.use(`${API_PREFIX}/emr`, emrRoutes);
app.use(`${API_PREFIX}/visits`, require('./modules/visit/visit.routes'));
app.use(`${API_PREFIX}/audit`, auditRoutes);
app.use(`${API_PREFIX}/patient`, patientRoutes);
app.use(`${API_PREFIX}/chatbot`, chatbotRoutes);
app.use(`${API_PREFIX}/admin`, require('./modules/admin/admin.routes'));
app.use(`${API_PREFIX}/workflow`, workflowRoutes);
app.use(`${API_PREFIX}/pharmacist`, pharmacistRoutes);
app.use(`${API_PREFIX}/insurance`, insuranceRoutes);
app.use(`${API_PREFIX}/compliance`, complianceRoutes);
app.use(`${API_PREFIX}/lab`, labRoutes);

// Mount routes (Legacy /api support for Frontend)
// Temporary debug routes
app.get('/debug-columns', async (req, res) => {
    try {
        const { query } = require('./config/db');
        const result = await query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_profiles' ORDER BY ordinal_position");
        res.json({ columns: result.rows.map(x => x.column_name) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/users', userRoutes);

// Phase 1: Staff Management routes
app.use(`${API_PREFIX}/staff`, staffRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/doctors/verification', doctorVerificationRoutes);
app.use('/api/visits', require('./modules/visit/visit.routes'));
app.use('/api/radiology', radiologyRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/lab', labRoutes);



// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
