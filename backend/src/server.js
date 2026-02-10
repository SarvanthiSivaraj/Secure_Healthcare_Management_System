require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const { initializeSessionJobs } = require('./jobs/autoLogout.job');
const logger = require('./utils/logger');
const config = require('./config/env');

const PORT = config.port || 5000;

// Test database connection before starting server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            logger.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Healthcare API Server started on port ${PORT}`);
            logger.info(`📝 Environment: ${config.nodeEnv}`);
            logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/${config.apiVersion}`);
            logger.info(`💚 Health Check: http://localhost:${PORT}/health`);

            // Initialize background jobs
            // initializeSessionJobs();
            // logger.info('✅ Session management jobs initialized');

            // Initialize consent scheduler
            // const { startConsentScheduler } = require('./services/consent.scheduler');
            // startConsentScheduler();
            // logger.info('✅ Consent scheduler initialized');
        });

        // Graceful shutdown
        const gracefulShutdown = () => {
            logger.info('Received shutdown signal. Closing server gracefully...');

            server.close(() => {
                logger.info('Server closed. Exiting process.');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        console.error('>>> FATAL ERROR:', error);
        process.exit(1);
    }
};

// Start the server
console.log('>>> Calling startServer()...');
startServer().catch(error => {
    console.error('>>> startServer() failed:', error);
    logger.error('Startup failed:', error);
    process.exit(1);
});
