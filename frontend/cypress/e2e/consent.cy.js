/**
 * E2E: Consent Management Flow
 *
 * Tests the patient consent grant/revoke cycle via the API.
 * A doctor user must exist for the recipientUserId to be valid.
 */

const PATIENT_EMAIL = 'e2e_patient@example.com';
const PATIENT_PASSWORD = 'TestPass@123';

describe('Consent Management Flow', () => {
    let doctorId;

    before(() => {
        // Log in as patient to set up token
        cy.loginByApi(PATIENT_EMAIL, PATIENT_PASSWORD);
    });

    it('GET /api/consent/active returns 200 with an array', () => {
        cy.loginByApi(PATIENT_EMAIL, PATIENT_PASSWORD);
        cy.apiGet('/consent/active').then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /api/consent/active returns 401 without token', () => {
        cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl')}/consent/active`,
            failOnStatusCode: false,
        }).then((res) => {
            expect(res.status).to.eq(401);
        });
    });

    it('POST /api/consent/grant returns 400 when required fields are missing', () => {
        cy.loginByApi(PATIENT_EMAIL, PATIENT_PASSWORD);
        cy.apiPost('/consent/grant', {
            // Missing dataCategory, purpose, accessLevel
            recipientUserId: '00000000-0000-0000-0000-000000000000',
        }).then((res) => {
            expect(res.status).to.eq(400);
        });
    });

    it('POST /api/consent/grant returns 400 for invalid dataCategory', () => {
        cy.loginByApi(PATIENT_EMAIL, PATIENT_PASSWORD);
        cy.apiPost('/consent/grant', {
            recipientUserId: '00000000-0000-0000-0000-000000000000',
            dataCategory: 'INVALID_CATEGORY',
            purpose: 'treatment',
            accessLevel: 'read',
        }).then((res) => {
            expect(res.status).to.be.oneOf([400, 404]);
        });
    });
});
