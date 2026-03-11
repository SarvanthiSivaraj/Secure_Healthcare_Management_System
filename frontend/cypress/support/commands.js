// ***********************************************
// Custom Cypress commands for the Healthcare app
// ***********************************************

/**
 * cy.login(email, password)
 * Logs in via the UI and stores the access token in localStorage.
 */
Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"], input[type="email"]').type(email);
    cy.get('[data-testid="password-input"], input[type="password"]').type(password);
    cy.get('[data-testid="login-button"], button[type="submit"]').click();
    // Wait for redirect away from /login
    cy.url().should('not.include', '/login');
});

/**
 * cy.loginByApi(email, password)
 * Logs in directly via API (faster, avoids UI flakiness for test setup).
 * Stores the token so subsequent cy.request() calls are authenticated.
 */
Cypress.Commands.add('loginByApi', (email, password) => {
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password })
        .then((res) => {
            expect(res.status).to.eq(200);
            const token = res.body.data?.accessToken || res.body.token;
            window.localStorage.setItem('accessToken', token);
            Cypress.env('accessToken', token);
        });
});

/**
 * cy.apiGet(path)
 * Authenticated GET request helper
 */
Cypress.Commands.add('apiGet', (path) => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}${path}`,
        headers: { Authorization: `Bearer ${Cypress.env('accessToken')}` },
        failOnStatusCode: false,
    });
});

/**
 * cy.apiPost(path, body)
 * Authenticated POST request helper
 */
Cypress.Commands.add('apiPost', (path, body) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}${path}`,
        headers: { Authorization: `Bearer ${Cypress.env('accessToken')}` },
        body,
        failOnStatusCode: false,
    });
});
