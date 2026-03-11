const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        // Point at the running React dev server
        baseUrl: 'http://localhost:3000',

        // Where E2E spec files live
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',

        // How long to wait for commands / page loads
        defaultCommandTimeout: 8000,
        pageLoadTimeout: 30000,

        // Video recording (useful for CI debugging)
        video: true,
        screenshotOnRunFailure: true,
        videosFolder: 'cypress/videos',
        screenshotsFolder: 'cypress/screenshots',

        // Backend API base for direct API calls inside tests
        env: {
            apiUrl: 'http://localhost:5000/api',
        },

        setupNodeEvents(on, config) {
            // You can add custom tasks (e.g. db seed) here
        },
    },
});
