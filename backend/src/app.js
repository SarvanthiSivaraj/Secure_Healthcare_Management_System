const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const consentRoutes = require('./modules/consent/consent.routes');
const emrRoutes = require('./modules/emr/emr.routes');
const workflowRoutes = require('./modules/workflow/workflow.routes');

// Phase 1: Staff Management routes
const staffRoutes = require('./modules/staff/staff.routes');
const doctorVerificationRoutes = require('./modules/doctors/doctor.verification.routes');


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

// API version prefix
const API_PREFIX = `/api/${config.apiVersion}`;

// Apply rate limiting to all API routes
app.use(API_PREFIX, apiLimiter);
app.use('/api', apiLimiter);

// Mount routes (Versioned)
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/consent`, consentRoutes);

// Mount routes (Legacy /api support for Frontend)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/workflow', workflowRoutes);

// Phase 1: Staff Management routes
app.use('/api/staff', staffRoutes);
app.use('/api/doctors/verification', doctorVerificationRoutes);
app.use('/api/visits', require('./modules/visit/visit.routes'));


// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
