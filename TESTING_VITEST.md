# Testing

## 1. Test Plan

### Introduction/Purpose
Validate backend unit behavior for access control and audit logging using Vitest.

### Scope
In-Scope:
- RBAC middleware
- ABAC middleware
- Consent middleware
- Audit logging middleware

Out-of-Scope:
- Integration tests (DB, email, file storage)
- Frontend tests

### Test Objectives
- Validate role and ownership checks
- Validate visit context, shift checks, and task assignment enforcement
- Validate consent enforcement and patient access rules
- Validate audit logging sanitizes sensitive fields

### Testing Approach
- Automated unit tests with Vitest
- External dependencies mocked (DB and services)

### Schedule & Milestones
- On-demand for local validation before commit

### Test Environment
- Node.js
- Windows

### Risks & Mitigation
- Risk: Real DB calls during unit tests
	- Mitigation: Mock DB and service modules in unit tests

### Deliverables
- Unit test files under backend/tests/unit
- Vitest configuration in backend/vitest.config.js

### Entry & Exit Criteria
Entry:
- Dependencies installed
- Backend folder is current working directory
Exit:
- All unit tests pass

## 2. Test Case Summary

These unit tests cover core middleware behavior. Details are documented in code comments and assertions.

Example cases:
- RBAC: Deny access when role is insufficient
- ABAC: Deny access when no active visit context
- Consent: Deny access when no active consent
- Audit: Redact sensitive fields before logging

## 3. Defect/Bug Report

No defects recorded in the latest unit test run.

## 4. Test Execution Report

Project Name: Secure Healthcare Information and Patient Management System

Tester: Vishnu Vardhan T

Date: 2026-02-12

Commands executed (from backend folder):

```bash
npm run test:vitest
```

Purpose: Run the backend unit test suite with Vitest in a single pass.

```bash
npm run test:vitest:watch
```

Purpose: Run the same unit tests in watch mode for faster local iteration.

Test Result Summary:
- Status: Pass
- Test Files: 4
- Tests: 22

Test Coverage:
- Backend middleware unit coverage (RBAC, ABAC, consent, audit)

Conclusion/Recommendations:
- Unit tests are passing and ready for commit.

### Scope Covered

Current unit coverage focuses on backend middleware:

- RBAC: role checks and ownership checks
- ABAC: visit context, shift checks, task assignment, time bounds
- Consent: patient access rules and staff consent enforcement
- Audit: request logging and sensitive field redaction

Tests live in backend/tests/unit and mock external dependencies (DB + services) to keep them fast and deterministic.
