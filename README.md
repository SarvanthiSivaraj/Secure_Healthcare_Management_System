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

| Tool | Minimum Version | Check |
|---|---|---|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| Docker & Docker Compose | v24+ / v2+ | `docker --version` |
| Git | any | `git --version` |
| PostgreSQL (local only) | v15+ | Only needed if running without Docker |

### Quick Start (Recommended)

The fastest way to go from a fresh clone to a running system:

```powershell
# 1. Clone and enter the project
git clone <repo-url>
cd Secure_Healthcare_Management_System

# 2. Run the bootstrap script — handles everything automatically
.\scripts\dev-bootstrap.ps1
```

This single command will:
- Verify all prerequisites (Node.js, Docker, npm, git)
- Create `backend/.env` from the example template and generate dev secrets
- Install backend and frontend dependencies (`npm ci`)
- Validate environment variables
- Run the backend test suite
- Start all services via Docker Compose with health-check verification

**Options:**

```powershell
.\scripts\dev-bootstrap.ps1 -WithTools    # Also starts pgAdmin on :5050
.\scripts\dev-bootstrap.ps1 -SkipDocker   # Install deps + run tests only (no containers)
.\scripts\dev-bootstrap.ps1 -FreshDb      # Wipe existing DB volumes and start clean
```

Once complete, the system is available at:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| pgAdmin (with `-WithTools`) | http://localhost:5050 |

---

### Manual Setup (Step-by-Step)

If you prefer to set up manually or are not using Docker:

#### 1. Environment Configuration

```powershell
# Copy the example env file
Copy-Item backend\.env.example backend\.env

# Generate secure dev secrets (recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste output into JWT_SECRET and JWT_REFRESH_SECRET in backend/.env

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste output into ENCRYPTION_KEY in backend/.env
```

Validate your configuration:

```powershell
node scripts\validate-env.js --env dev
```

#### 2. Install Dependencies

```powershell
cd backend;  npm ci
cd ..\frontend; npm ci
cd ..
```

#### 3. Database Setup

**Option A — Docker Compose (recommended):**

```powershell
docker compose -f docker-compose.dev.yaml up postgres -d
# Wait for healthy status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Option B — Local PostgreSQL:**

Create a database named `healthcare_db` (or match your `.env` value).

Then run migrations:

```powershell
# Check migration status
node scripts\migrate-orchestrator.js --status

# Apply all schemas and migrations (fresh DB)
node scripts\migrate-orchestrator.js --from-scratch

# Seed initial data (roles, admin user, sample doctors)
cd backend
npm run db:seed
```

#### 4. Start Services

**With Docker (recommended):**

```powershell
docker compose -f docker-compose.dev.yaml up --build -d

# Follow logs
docker compose -f docker-compose.dev.yaml logs -f
```

**Without Docker:**

```powershell
# Terminal 1 — Backend
cd backend
npm run dev      # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start        # Starts on http://localhost:3000
```

---

### Docker Compose Profiles

| File | Purpose | Usage |
|---|---|---|
| `docker-compose.dev.yaml` | Development — hot-reload, debug port, relaxed limits | `docker compose -f docker-compose.dev.yaml up --build` |
| `docker-compose.prod.yaml` | Production reference — read-only root, cap_drop ALL, resource limits, network segmentation | `docker compose -f docker-compose.prod.yaml up -d` |
| `docker-compose.yaml` | Legacy/general-purpose (preserved for backward compatibility) | `docker compose up` |

---

### Database Migrations

Migrations are managed by a deterministic orchestrator that tracks applied migrations in a `_migrations` table:

```powershell
# View status of all migrations
node scripts\migrate-orchestrator.js --status

# Preview what would be applied (no changes)
node scripts\migrate-orchestrator.js --dry-run

# Apply only pending incremental migrations
node scripts\migrate-orchestrator.js

# Full setup from scratch (base schemas + all migrations)
node scripts\migrate-orchestrator.js --from-scratch
```

Migrations are idempotent and tracked by ID — re-running is safe.

---

### Environment Validation

Before starting the system or deploying, validate env vars:

```powershell
# For development
node scripts\validate-env.js --env dev

# For production (stricter checks — no placeholders, no wildcard CORS)
node scripts\validate-env.js --env prod
```

The validator checks for missing required variables, placeholder values, insecure defaults, and production-specific security rules.

---

## Monitoring & Security

### Security Scanning

```powershell
# Install Trivy
choco install trivy  # Windows
brew install trivy   # macOS

# Run security scan
.\scripts\security-scan.ps1
```

Automated scans run daily in CI/CD. Results appear in GitHub Security tab.

### Monitoring Stack

```powershell
# Start monitoring (Prometheus + Grafana)
docker compose -f docker-compose.monitoring.yaml up -d
```

- **Grafana:** http://localhost:3001 (admin/admin)
- **Prometheus:** http://localhost:9090  
- **Metrics:** http://localhost:5000/metrics

Pre-configured dashboards track API performance, database health, and HIPAA compliance metrics.

See [docs/devops/README.md](docs/devops/README.md) for details.

---

## Testing

### Backend Tests

```powershell
cd backend
npm test              # Run all unit tests (Vitest)
npm run test:vitest:watch   # Watch mode
```

### Manual API Testing with Postman

1. **Login:** `POST /api/auth/login` with email and password
2. **Use Token:** Add the returned `accessToken` to the `Authorization` header as `Bearer <token>`
3. **Health Check:** `GET /health` — no auth required

---

### Common Operations Cheat Sheet

```powershell
# Start dev environment
docker compose -f docker-compose.dev.yaml up -d

# Stop all services
docker compose -f docker-compose.dev.yaml down

# Reset database (wipe volumes)
docker compose -f docker-compose.dev.yaml down -v

# View backend logs
docker compose -f docker-compose.dev.yaml logs -f backend

# Run backend tests
cd backend; npm test

# Check migration status
node scripts\migrate-orchestrator.js --status

# Validate environment
node scripts\validate-env.js --env dev
```

---

## Contact
**Project Team:**  
[Add Team Members Here]
