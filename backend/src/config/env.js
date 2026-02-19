require('dotenv').config();

const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    apiVersion: process.env.API_VERSION || 'v1',

    // Database
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'healthcare_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // OTP
    otp: {
        expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
        maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 3,
        length: parseInt(process.env.OTP_LENGTH) || 6,
    },

    // Email
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM,
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
        loginWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 900000,
        loginMaxAttempts: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || ((process.env.NODE_ENV || 'development') === 'development' ? 50 : 5), // More lenient in dev
        otpWindowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS) || 3600000,
        otpMaxAttempts: parseInt(process.env.OTP_RATE_LIMIT_MAX_ATTEMPTS) || 3,
    },

    // Session
    session: {
        timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30,
        autoLogoutEnabled: process.env.AUTO_LOGOUT_ENABLED === 'true',
    },

    // Security
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        encryptionKey: process.env.ENCRYPTION_KEY,
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN
            ? (process.env.CORS_ORIGIN === '*' 
                ? '*' 
                : process.env.CORS_ORIGIN.includes(',')
                    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
                    : process.env.CORS_ORIGIN.trim())
            : 'http://localhost:3000',
    },

    // File Upload
    upload: {
        maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
        uploadPath: process.env.UPLOAD_PATH || './uploads',
    },

    // Audit
    audit: {
        logRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 2555,
        enableHashChain: process.env.ENABLE_HASH_CHAIN === 'true',
    },

    // Emergency Access
    emergency: {
        accessDurationMinutes: parseInt(process.env.EMERGENCY_ACCESS_DURATION_MINUTES) || 60,
        notificationDelayHours: parseInt(process.env.EMERGENCY_NOTIFICATION_DELAY_HOURS) || 24,
    },
};

// Validate required environment variables
const validateConfig = () => {
    const required = [
        'DB_PASSWORD',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please check your .env file');
        process.exit(1);
    }
};

if (config.nodeEnv !== 'test') {
    validateConfig();
}

module.exports = config;
