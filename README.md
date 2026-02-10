# Secure Healthcare Information & Patient Management System with Regulatory Compliance

A security-first healthcare platform designed to protect sensitive medical data through patient ownership, consent-driven access, role-based authorization, and fully auditable workflows aligned with GDPR and HIPAA principles.

---

## Overview

Modern healthcare systems manage extremely sensitive data such as diagnoses, prescriptions, laboratory reports, imaging results, and treatment histories. As healthcare services continue to digitize, protecting this data while ensuring controlled accessibility has become a critical engineering challenge.

This project implements a secure healthcare information and patient management system that embeds privacy, security, and regulatory considerations directly into system architecture rather than treating them as external requirements.

The platform models real-world healthcare interactions between patients, doctors, nurses, laboratories, pharmacists, administrators, insurers, and researchers while enforcing strict governance over medical data access.

The system is built on the principle that **trust in healthcare software must be engineered — not assumed.**

---

## Problem Statement

Healthcare data governance is inherently complex due to the involvement of multiple stakeholders and the confidential nature of medical information. Although regulatory frameworks such as GDPR and HIPAA define strict requirements for handling patient data, many existing systems fail to enforce these principles at the engineering layer.

The challenge addressed in this project is to design a healthcare platform that responsibly manages sensitive medical data by embedding security, ethical, and compliance requirements directly into workflows and access control mechanisms — ensuring every data interaction is authorized, purposeful, traceable, and compliant.

---

## Objectives

- Establish **patient ownership** of medical data  
- Enforce a **default-deny access model**  
- Implement **consent-driven data sharing**  
- Support **role-based and context-aware authorization**  
- Maintain **immutable audit trails**  
- Ensure **compliance-ready architecture**  
- Enable secure clinical workflows  
- Build a resilient and trustworthy healthcare system  

---

## Stakeholders

- Patient (Primary Data Owner)  
- Doctor  
- Nurse  
- Laboratory Technician  
- Radiologist  
- Pharmacist  
- Hospital Administrator  
- Application Administrator  
- Insurance Provider  
- Research Organization  
- Compliance Officer  

---

## System Scope

The platform supports:

- Patient identity and profile management  
- Hospital, clinic, and pharmacy onboarding  
- Staff role governance  
- Consent lifecycle management  
- Visit-based access control  
- Electronic Medical Records (EMR)  
- Clinical workflow orchestration  
- Emergency ("Break-Glass") access governance  
- Audit logging and compliance reporting  

---

## Key Features

###  Security & Access Control
- Role-Based Access Control (RBAC)  
- Attribute-Based Access Control (ABAC)  
- Least-privilege enforcement  
- Default deny policy  
- Time-bound permissions  
- Emergency access with mandatory justification  

###  Privacy & Consent Governance
- Patient-controlled consent  
- Purpose-based access restrictions  
- Data-category filtering  
- Immediate consent revocation  
- Delegated consent for caregivers  
- Permanent locking of highly sensitive records  

###  Clinical Systems
- Electronic Medical Records  
- Diagnosis immutability  
- Treatment plan versioning  
- Digital prescriptions  
- Lab and imaging workflows  
- Visit lifecycle management  

###  Compliance & Traceability
- Immutable audit logs  
- Tamper-resistant storage  
- Encryption at rest and in transit  
- Compliance-ready reporting  
- Anonymized datasets for research  

---

## System Architecture

The platform follows a secure layered architecture designed to validate every access request before data exposure.
```
Secure_Healthcare_Management_System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   │   ├── abac.middleware.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── consent.middleware.js
│   │   │   ├── rbac.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── patient.model.js
│   │   │   ├── consent.model.js
│   │   │   ├── visit.model.js
│   │   │   ├── medical_record.model.js
│   │   │   ├── audit_log.model.js
│   │   │   └── notification.model.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── consent/
│   │   │   ├── emr/
│   │   │   ├── visit/
│   │   │   └── workflow/
│   │   ├── services/
│   │   │   ├── audit.service.js
│   │   │   ├── encryption.service.js
│   │   │   ├── otp.service.js
│   │   │   └── violation.service.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── logger.js
│   │   │   └── validators.js
│   │   └── app.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── consentApi.js
│   │   │   ├── emrApi.js
│   │   │   ├── visitApi.js
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── clinical/
│   │   │   │   ├── LabRequestForm.jsx
│   │   │   │   ├── ImagingRequestForm.jsx
│   │   │   │   └── Prescriptions.jsx
│   │   │   ├── common/
│   │   │   ├── emergency/
│   │   │   └── emr/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Doctor/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── PatientRecords.jsx
│   │   │   ├── Lab/
│   │   │   ├── Nurse/
│   │   │   ├── Patient/
│   │   │   └── Radiology/
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── styles/
│   │   └── App.js
│   └── public/
└── README.md
```
---

## Tech Stack

**Frontend:** React  
**Backend:** Node.js + Express  
**Database:** PostgreSQL  
**Authentication:** JWT + OTP Verification  
**Security:** TLS, encryption, audit logging  
**File Storage:** Secure upload with validation  
**Schedulers:** Background jobs for consent expiry, emergency access expiry, and backups  

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)

### 1. Database Setup
1. Create a PostgreSQL database (default name: `healthcare_db`).
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Configure environment variables (create `.env` based on `.env.example`).
4. Run migrations and seed data:
   ```bash
   npm install
   npm run db:migrate  # Creates tables
   npm run db:seed     # Creates initial roles and admin user
   ```

### 2. Backend Setup
1. Start the server in development mode:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000` (default).

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`.

---

## Testing

### Backend Tests
Navigate to `backend/` and run:
- **Unit/Integration Tests:** `npm test`
- **Manual Verification:** 
  Run standalone scripts in `backend/` to verify logic:
  ```bash
  node test_admin_login.js
  ```

### Manual Testing with Postman
1. **Login:** `POST /api/auth/login`
2. **Use Token:** Add the returned `accessToken` to the `Authorization` header (`Bearer <token>`) for subsequent requests.

---

## Contact
**Project Team:**  
[Add Team Members Here]
