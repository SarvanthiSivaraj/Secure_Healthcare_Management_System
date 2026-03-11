/**
 * E2E: Patient Visit Request Flow
 *
 * Tests the patient journey: login → visit request → view visits.
 * Uses cy.loginByApi() to log in quickly, then exercises the UI.
 *
 * Prerequisites:
 *  - A test patient account must exist (see beforeEach cleanup / seed)
 *  - A hospital with a known hospital_code must be registered
 */

const PATIENT_EMAIL = 'e2e_patient@example.com';
const PATIENT_PASSWORD = 'TestPass@123';
const HOSPITAL_CODE = 'HC001';          // Update to match a seeded org

describe('Patient Visit Request Flow', () => {
    beforeEach(() => {
        // Authenticate via API for speed — avoids re-testing the login UI in every spec
        cy.loginByApi(PATIENT_EMAIL, PATIENT_PASSWORD);
    });

    it('patient can request a visit via the API', () => {
        cy.apiPost('/visits/request', {
            hospitalCode: HOSPITAL_CODE,
            reason: 'Routine check-up',
            symptoms: 'Mild fever',
        }).then((res) => {
            // 201 = created, 409 = already has active visit (also acceptable)
            expect([201, 409]).to.include(res.status);
        });
    });

    it('patient can retrieve their visits via the API', () => {
        cy.apiGet('/visits/my-visits').then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.success).to.eq(true);
        });
    });

    it('visit request page is accessible when logged in', () => {
        cy.visit('/patient/request-visit');
        // The page should render without a 404/error
        cy.get('body').should('not.contain.text', '404');
    });

    it('returns 401 for unauthenticated visit request', () => {
        cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/visits/request`,
            body: { hospitalCode: HOSPITAL_CODE },
            failOnStatusCode: false,
        }).then((res) => {
            expect(res.status).to.eq(401);
        });
    });
});
