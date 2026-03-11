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

```text
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
│   │   └── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── clinical/ (Lab, Imaging, Prescriptions)
│   │   │   ├── emergency/
│   │   │   └── emr/
│   │   ├── pages/ (Doctor, Nurse, Patient, Lab, Radiology, Admin)
│   │   └── App.js
└── README.md
```


---

## Key Features

###  Security & Access Control
- **RBAC & ABAC:** Fine-grained Role-Based and Attribute-Based Access Control.
- **Zero Trust:** Default-deny policy with least-privilege enforcement.
- **Break-Glass Access:** Secure emergency access with mandatory justification and audit alerts.
- **QR Code Check-in:** Secure visitor check-in using QR codes for touchless verification.

###  Privacy & Consent Governance
- **Patient-Controlled Consent:** Granular control over who can access specific data categories.
- **Purpose-Based Access:** Data access is restricted based on the clinical purpose of the visit.
- **Immediate Revocation:** Patients can revoke consent at any time, instantly locking data.

###  Clinical Systems
- **EMR Management:** Immutable diagnoses and versioned treatment plans.
- **Digital Prescriptions:** End-to-end pharmacy workflow tracking.
- **AI Health Screening:** Integrated AI Chatbot for preliminary health screening and symptom checking.
- **Lab & Imaging:** Full lifecycle management for medical orders and results.

###  Compliance & Traceability
- **Immutable Audit Logs:** Every data interaction is recorded in a tamper-resistant audit trail.
- **Encryption:** AES-256 encryption for data at rest and TLS 1.3 for data in transit.
- **Regulatory Readiness:** Built-in reporting for HIPAA and GDPR compliance audits.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS (Visual Excellence)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with Row-Level Security)
- **Security:** JWT, OTP (Multi-Factor), Bcrypt, Crypto.js
- **DevOps:** Docker, Prometheus, Grafana, Trivy (Security Scanning)

---

## Installation & Setup

### Prerequisites

- Node.js v18+
- Docker & Docker Compose v24+
- PostgreSQL v15+ (if running locally)

### Quick Start (Recommended)

```powershell
# 1. Clone and enter the project
git clone <repo-url>
cd Secure_Healthcare_Management_System

# 2. Run the bootstrap script
.\scripts\dev-bootstrap.ps1 -WithTools
```

Once complete, the system is available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Grafana Metrics:** http://localhost:3001

---

## Future Roadmap

1.  **AI-Assisted Illness Prediction:** Advanced ML models for early diagnosis.
2.  **Mobile-First Patient App:** Dedicated React Native application for patients.
3.  **FHIR/HL7 Interoperability:** Standardized healthcare data exchange.
4.  **Blockchain-Anchored Audit Trail:** Higher-tier immutability for logs.
5.  **Federated Identity:** Integration with hospital-wide SSO systems.
6.  **Patient Data Portability:** Structured data export (JSON/PDF).
7.  **Anomaly Detection:** Real-time AI alerts for suspicious access patterns.
8. **Load Testing Suite:** Automated end-to-end performance validation.

---

## Project Team

- **Chirag Keshav** [CB.SC.U4CSE23014]
- **Devansh Dewan** [CB.SC.U4CSE23017]
- **Harish G M** [CB.SC.U4CSE23027]
- **Harshita R** [CB.SC.U4CSE23028]
- **Sarvanthikha SR** [CB.SC.U4CSE23048]
- **Theegela Vishnu Vardhan** [CB.SC.U4CSE23056]

---
© 2026 Secure Healthcare Management System | Amrita Vishwa Vidyapeetham
