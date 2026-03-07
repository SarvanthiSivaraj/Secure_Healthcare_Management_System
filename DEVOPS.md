# DevOps Documentation — Secure Healthcare Management System

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Environments & Topology](#4-environments--topology)
5. [Infrastructure as Code (Docker)](#5-infrastructure-as-code-docker)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Secrets Management](#7-secrets-management)
8. [Database Migration & Seeding](#8-database-migration--seeding)
9. [Monitoring, Logging & Observability](#9-monitoring-logging--observability)
10. [Backup & Disaster Recovery](#10-backup--disaster-recovery)
11. [Security Hardening](#11-security-hardening)
12. [Access Governance](#12-access-governance)
13. [Compliance & Regulatory Controls](#13-compliance--regulatory-controls)
14. [Incident Response](#14-incident-response)
15. [SLAs & SLOs](#15-slas--slos)
16. [Change Management](#16-change-management)
17. [Runbooks & Troubleshooting](#17-runbooks--troubleshooting)
18. [Contact & Ownership](#18-contact--ownership)
19. [References & Supporting Documents](#19-references--supporting-documents)

---

## 1. Overview

This document provides a comprehensive guide to the DevOps practices, workflows, and operational controls for the **Secure Healthcare Management System**. It is designed for engineers, SREs, platform teams, and auditors to ensure secure, compliant, and reliable delivery of healthcare software.

**System Purpose:** Web-based platform for managing patient registration, electronic medical records (EMR), clinical workflows, staff identity/access (RBAC + ABAC), consent management, and regulatory compliance (HIPAA / GDPR).

---

## 2. Architecture & Technology Stack

| Component        | Technology                                 | Version   |
|------------------|--------------------------------------------|-----------|
| Backend API      | Node.js / Express.js                      | Node 20   |
| Frontend         | React (CRA)                               | React 18  |
| Database         | PostgreSQL (local or Supabase)            | 15+       |
| Frontend Server  | nginx (production), CRA dev server (dev)  | alpine    |
| Containerisation | Docker, Docker Compose                    | 28+       |
| CI/CD            | GitHub Actions                            | v4        |
| Testing          | Vitest (unit), Jest (integration)         | —         |
| Process Manager  | dumb-init (Docker)                        | —         |
| Logging          | Winston                                   | —         |

### High-Level Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│   Frontend   │────▶│  Backend API │────▶│  PostgreSQL / Supabase│
│  React / nginx│    │  Express.js  │     │   (encrypted at rest) │
└──────────────┘     └──────┬───────┘     └──────────────────────┘
                            │
                     ┌──────▼───────┐
                     │  Audit Logs  │
                     │ (hash-chain) │
                     └──────────────┘
```

---

## 3. Repository Structure

```
├── .github/workflows/          # CI/CD pipeline definitions
│   ├── backend-ci.yml          # Backend: test, lint, audit, Docker build
│   └── frontend-ci.yml         # Frontend: test, build, audit, Docker build
├── backend/
│   ├── Dockerfile              # Multi-stage: development / build / production
│   ├── src/
│   │   ├── server.js           # Entry point
│   │   ├── app.js              # Express app, route mounting
│   │   ├── config/             # db.js, env.js, jwt.js, mail.js
│   │   ├── middleware/         # auth, rbac, abac, audit, consent, rate-limit
│   │   ├── models/             # Data access layer
│   │   ├── modules/            # Feature modules (auth, emr, admin, staff, etc.)
│   │   ├── database/           # Schema SQL, migrations, seed scripts
│   │   └── utils/              # Logger, constants, helpers
│   └── tests/unit/             # Vitest unit tests
├── frontend/
│   ├── Dockerfile              # Multi-stage: development / build / production (nginx)
│   └── src/                    # React application
├── scripts/
│   ├── dev-bootstrap.ps1       # One-command local setup (PowerShell)
│   ├── validate-env.js         # Environment variable validation
│   └── migrate-orchestrator.js # Deterministic migration runner
├── docs/devops/                # Supporting DevOps documentation
│   ├── threat-model.md
│   ├── data-classification.md
│   ├── logging-threat-coverage.md
│   └── environment-matrix-runbook.md
├── docker-compose.yaml         # Base compose
├── docker-compose.dev.yaml     # Development overrides
├── docker-compose.prod.yaml    # Production overrides
└── DEVOPS.md                   # This document
```

---

## 4. Environments & Topology

| Attribute           | Development                     | Staging                              | Production                            |
|---------------------|---------------------------------|--------------------------------------|---------------------------------------|
| **Compose File**    | `docker-compose.dev.yaml`       | `docker-compose.prod.yaml` + staging overrides | `docker-compose.prod.yaml`  |
| **Backend Target**  | `development` (nodemon, hot-reload) | `production`                    | `production`                          |
| **Frontend Target** | `development` (CRA dev server)  | `production` (nginx)                | `production` (nginx)                  |
| **Database**        | Local PostgreSQL or Supabase    | Supabase / managed PostgreSQL       | Supabase / managed PostgreSQL         |
| **DB Port Exposed** | `5432` on host                  | Not exposed                         | Not exposed                           |
| **Debug Port**      | `9229` (Node inspector)         | Disabled                            | Disabled                              |
| **pgAdmin**         | Available (`--profile tools`)   | Disabled                            | Disabled                              |
| **Data Policy**     | Synthetic data only             | Synthetic data only                 | Real data, encrypted at rest & transit|
| **CORS**            | `http://localhost:3000`         | Staging domain                      | Production domain                     |
| **Rate Limiting**   | Relaxed (1000 req/15 min)       | Production values                   | Strict (100 req/15 min)              |
| **Read-only FS**    | No                              | Yes                                 | Yes                                   |
| **cap_drop ALL**    | No                              | Yes                                 | Yes                                   |
| **Resource Limits** | None                            | Enforced                            | Enforced                              |

### Network Segmentation (Production)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Public Net │────▶│   App Net   │────▶│  Data Net   │
│  (frontend) │     │  (backend)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
```

Full environment matrix: [docs/devops/environment-matrix-runbook.md](docs/devops/environment-matrix-runbook.md)

---

## 5. Infrastructure as Code (Docker)

### Backend Dockerfile (`backend/Dockerfile`)

| Stage          | Base Image       | Purpose                                           |
|----------------|------------------|---------------------------------------------------|
| `base`         | `node:20-alpine` | Install security updates, dumb-init, set WORKDIR  |
| `development`  | ← base          | `npm ci` (all deps), hot-reload via nodemon       |
| `build`        | ← base          | `npm ci --only=production`, copy source           |
| `production`   | `node:20-alpine` | Non-root user (`nodejs:1001`), read-only friendly, health check, dumb-init |

### Frontend Dockerfile (`frontend/Dockerfile`)

| Stage          | Base Image       | Purpose                                           |
|----------------|------------------|---------------------------------------------------|
| `base`         | `node:20-alpine` | Install security updates, set WORKDIR             |
| `development`  | ← base          | `npm ci`, CRA dev server on port 3000             |
| `build`        | ← base          | `npm ci`, `npm run build`                         |
| `production`   | `nginx:alpine`   | Serve static build, security headers, gzip, health check |

### Security Controls in Docker

- Non-root user in production (`nodejs:1001`)
- `dumb-init` for proper PID 1 signal handling
- Security headers injected via nginx config (X-Frame-Options, X-Content-Type-Options, CSP, etc.)
- Health checks on all containers
- `cap_drop: ALL` in production compose
- Read-only root filesystem in production

---

## 6. CI/CD Pipeline

### Pipeline Files

| Workflow             | File                                  | Trigger                       |
|----------------------|---------------------------------------|-------------------------------|
| Backend CI           | `.github/workflows/backend-ci.yml`   | Push/PR to `main` (backend/**)|
| Frontend CI          | `.github/workflows/frontend-ci.yml`  | Push/PR to `main` (frontend/**)|

### Backend CI Pipeline Stages

```
Checkout → Setup Node 20 → npm ci → Lint → DB Setup →
Unit Tests (Vitest) → Integration Tests (Jest) →
Coverage Upload (Codecov) → Security Audit (npm audit) →
Build Verification → Docker Image Build (on push)
```

| Stage                | Tool / Action                | Failure Policy       |
|----------------------|------------------------------|----------------------|
| Lint                 | `npm run lint`               | continue-on-error    |
| Unit Tests           | `npm test` (Vitest)          | **Block on failure** |
| Integration Tests    | `npm run test:integration`   | continue-on-error    |
| Coverage Upload      | `codecov/codecov-action@v3`  | continue-on-error    |
| Security Audit       | `npm audit --audit-level=moderate` | continue-on-error |
| Docker Build         | `docker/build-push-action@v5`| continue-on-error    |

### Frontend CI Pipeline Stages

```
Checkout → Setup Node 20 → npm ci → Lint →
Tests (Jest, CI=true) → Coverage Upload (Codecov) →
Production Build → Build Size Check →
Artifact Upload → Security Audit → Docker Image Build (on push)
```

| Stage                | Tool / Action                | Failure Policy       |
|----------------------|------------------------------|----------------------|
| Tests                | `npm test -- --watchAll=false` | **Block on failure** |
| Production Build     | `npm run build`              | **Block on failure** |
| Build Size Check     | `du -sh build`               | Informational        |
| Artifact Upload      | `actions/upload-artifact@v4` | On push only         |
| Security Audit       | `npm audit --audit-level=moderate` | continue-on-error |
| Docker Build         | `docker/build-push-action@v5`| continue-on-error    |

### Docker Image Tagging

- Images tagged with commit SHA: `healthcare-backend:<sha>`, `healthcare-frontend:<sha>`
- Build caching via GitHub Actions cache (`type=gha`)

### Promotion Model

```
Feature Branch → PR → main (CI runs) → Staging Deploy → Production Deploy
                  ↑                         ↑                  ↑
             Code Review              Auto on merge      Manual approval
```

---

## 7. Secrets Management

| Secret Type        | Example Key              | Storage (Dev)   | Storage (Prod)  | Rotation Policy |
|--------------------|--------------------------|-----------------|-----------------|-----------------|
| DB credentials     | `DB_PASSWORD`            | `backend/.env`  | Vault / CI vars | 90 days         |
| JWT access secret  | `JWT_SECRET`             | `backend/.env`  | Vault / CI vars | 90 days         |
| JWT refresh secret | `JWT_REFRESH_SECRET`     | `backend/.env`  | Vault / CI vars | 90 days         |
| Encryption key     | `ENCRYPTION_KEY`         | `backend/.env`  | Vault / CI vars | 90 days         |
| SMTP credentials   | `EMAIL_PASSWORD`         | `backend/.env`  | Vault / CI vars | 180 days        |

### Rules

1. **Never** commit real secrets to version control.
2. `.env` files are listed in `.gitignore`.
3. Use `backend/.env.example` and `frontend/.env.example` as templates for new environments.
4. The bootstrap script (`scripts/dev-bootstrap.ps1`) auto-generates dev secrets from placeholders.
5. Validate all required variables with `node scripts/validate-env.js --env dev|prod`.
6. In CI, secrets are injected via workflow `env:` blocks with test-only values.

---

## 8. Database Migration & Seeding

### Migration Strategy

| Component                | Tool / Script                                 |
|--------------------------|-----------------------------------------------|
| Migration Orchestrator   | `scripts/migrate-orchestrator.js`             |
| Schema Files             | `backend/src/database/schema.sql`, `schema_emr.sql`, `schema_staff_management.sql`, `schema_workflow.sql` |
| Migration Tracking       | `_migrations` table in database               |
| Manual Migration         | `npm run db:migrate`                          |
| Full DB Setup            | `npm run db:setup:all`                        |

### Seeding

| Command                    | Script                                      | Purpose                        |
|----------------------------|---------------------------------------------|--------------------------------|
| `npm run db:seed`          | `backend/src/database/seed.js`              | Base seed (admin, doctors, nurses, org) |
| Direct invocation          | `backend/src/database/seed_doctors.js`      | Doctor profiles                |
| Direct invocation          | `backend/src/database/seed_extended.js`     | Extended test data             |

### Rules

1. Always run migrations before seeding.
2. Migrations must be backward-compatible (additive changes preferred).
3. Seed scripts use `ON CONFLICT` to be idempotent.
4. Never use production data for seeding dev/staging environments.

---

## 9. Monitoring, Logging & Observability

### Logging Framework

| Component        | Tool      | Output                          | Format     |
|------------------|-----------|---------------------------------|------------|
| Application logs | Winston   | Console + `logs/combined.log`   | Structured |
| Error logs       | Winston   | `logs/error.log`                | Structured |
| HTTP access logs | Winston   | Console (http level)            | Structured |
| DB query logs    | Winston   | Console (debug level)           | Structured |
| Audit logs       | Custom    | `audit_logs` DB table           | Hash-chain |

### Log Levels

| Level   | Usage                                        |
|---------|----------------------------------------------|
| `error` | Unrecoverable failures, DB errors            |
| `warn`  | Access denied, consent failures, anomalies   |
| `info`  | DB connect, server start, migrations         |
| `http`  | Every HTTP request (method, path, IP, UA)    |
| `debug` | SQL queries (text, duration, row count)      |

### Health Check

- **Endpoint:** `GET /health`
- **Response:** `{ success: true, message: "Healthcare API is running", timestamp, environment }`
- **Docker:** Built-in `HEALTHCHECK` on all containers (30s interval, 10s timeout, 3 retries)

### Monitoring Signals & Alert Ownership

| Signal                    | Source                   | Alert Owner  |
|---------------------------|--------------------------|--------------|
| Health check failures     | `/health` endpoint       | DevOps       |
| Container restart loops   | Docker daemon            | DevOps       |
| Audit log anomalies       | `audit_logs` table       | Security     |
| Rate limit triggers       | Application logs (warn)  | DevOps       |
| Privilege escalation      | Audit logs               | Security     |
| Excessive record access   | Audit logs               | Security     |
| Failed login spikes       | Application logs         | Security     |
| DB connection failures    | Application logs (error) | DevOps       |

### Audit Log Integrity

- Audit logs are stored in the `audit_logs` PostgreSQL table.
- Hash-chain integrity: each entry is cryptographically linked to the previous entry.
- Audit logs are immutable — no UPDATE or DELETE operations permitted.

Full threat-to-logging mapping: [docs/devops/logging-threat-coverage.md](docs/devops/logging-threat-coverage.md)

---

## 10. Backup & Disaster Recovery

> **Note:** Automated backup scripts are planned but not yet implemented. The table below defines the target policy. If using Supabase, backups are managed by the Supabase platform.

| Asset         | Frequency | Retention | Encryption | Backup Method          | Status    |
|---------------|-----------|-----------|------------|------------------------|-----------|
| Database      | Daily     | 90 days   | Yes        | pg_dump / Supabase auto| Planned   |
| Audit logs    | Weekly    | 7 years   | Yes        | pg_dump + offsite      | Planned   |
| App logs      | Daily     | 1 year    | Yes        | Log rotation + archive | Planned   |

### Disaster Recovery Targets

| Metric | Target     | Notes                                    |
|--------|------------|------------------------------------------|
| RPO    | ≤ 24 hours | Maximum acceptable data loss             |
| RTO    | ≤ 4 hours  | Maximum acceptable downtime              |

### Recovery Procedures

1. Restore database from latest backup.
2. Verify audit log hash-chain integrity post-restore.
3. Redeploy application containers from CI-built images.
4. Run `scripts/validate-env.js` to confirm environment.
5. Conduct restore drill quarterly.

---

## 11. Security Hardening

### Application Layer

| Control                              | Implementation                                     |
|--------------------------------------|---------------------------------------------------|
| Helmet.js security headers           | `app.js` — applied globally                       |
| CORS whitelisting                    | `app.js` — origin from `CORS_ORIGIN` env var      |
| Rate limiting                        | `rateLimit.middleware.js` — per IP                 |
| Request body size limit              | Express JSON/URL-encoded — 10 MB max               |
| Input validation                     | Per-route validation in controllers                |
| Password hashing                     | bcrypt with configurable rounds                    |
| JWT expiry                           | Access: 24h, Refresh: 7d (configurable)            |
| Encryption at rest                   | AES-256-GCM for sensitive fields                   |

### Infrastructure Layer

| Control                              | Implementation                                     |
|--------------------------------------|---------------------------------------------------|
| Non-root container user              | `nodejs:1001` in production Dockerfile             |
| `cap_drop: ALL`                      | Production compose file                            |
| Read-only root filesystem            | Production compose file                            |
| Resource limits (CPU, memory)        | Production compose file                            |
| Network segmentation                 | 3-zone network in production                       |
| TLS/SSL                              | Database connections use SSL for Supabase           |
| Security headers (nginx)             | X-Frame-Options, CSP, X-Content-Type-Options, etc.|

### RBAC + ABAC

| Middleware                 | Purpose                                              |
|----------------------------|------------------------------------------------------|
| `auth.middleware.js`       | JWT verification, token refresh                      |
| `rbac.middleware.js`       | Role-based route protection                          |
| `abac.middleware.js`       | Attribute-based access (shift, org, care-team scope) |
| `consent.middleware.js`    | Patient consent verification before data access      |
| `audit.middleware.js`      | Immutable audit trail for all sensitive operations   |

---

## 12. Access Governance

| Practice                        | Frequency     | Owner       |
|---------------------------------|---------------|-------------|
| User access reviews             | Quarterly     | Compliance  |
| Privileged account audits       | Quarterly     | Security    |
| Dormant account cleanup         | Monthly       | DevOps      |
| Break-glass access review       | Post-use      | Security    |
| Role permission reviews         | Semi-annually | Compliance  |
| Secret rotation                 | Per policy    | DevOps      |

### Break-Glass Procedure

1. Break-glass access is logged with full audit trail.
2. Post-use review required within 24 hours.
3. All actions during break-glass session are flagged for compliance audit.

---

## 13. Compliance & Regulatory Controls

| Control                  | Standard              | Implementation                                |
|--------------------------|-----------------------|-----------------------------------------------|
| Data encryption at rest  | HIPAA §164.312(a)(2) | AES-256-GCM for PHI fields                   |
| Data encryption in transit | HIPAA §164.312(e) | SSL/TLS for DB, HTTPS for API                |
| Consent management       | GDPR Art. 7           | `consent.middleware.js`, consent model        |
| Audit logging            | HIPAA §164.312(b)    | Hash-chained audit logs, immutable            |
| Access controls          | HIPAA §164.312(a)(1) | RBAC + ABAC middleware                        |
| Data retention           | HIPAA, GDPR           | Configurable retention per data class         |
| Data minimisation        | GDPR Art. 5(1)(c)    | Field-level masking (`masking.middleware.js`) |
| Right to access          | GDPR Art. 15          | Patient data export capabilities              |
| Breach notification      | GDPR Art. 33          | Incident response procedure (Section 14)     |

Full data classification: [docs/devops/data-classification.md](docs/devops/data-classification.md)

---

## 14. Incident Response

### Severity Levels

| Level    | Definition                                       | Response Time | Examples                          |
|----------|--------------------------------------------------|---------------|-----------------------------------|
| **P1**   | Complete service outage or data breach           | 15 minutes    | DB down, PHI exposure, auth bypass|
| **P2**   | Partial outage or security vulnerability         | 1 hour        | API errors, rate limit bypass     |
| **P3**   | Degraded performance or minor issue              | 4 hours       | Slow queries, log rotation failure|
| **P4**   | Cosmetic or low-impact issue                     | Next business day | UI glitch, warning logs       |

### Incident Response Steps

1. **Detect** — Health checks, monitoring alerts, user reports.
2. **Triage** — Assign severity, page on-call if P1/P2.
3. **Contain** — Isolate affected service, block malicious traffic.
4. **Investigate** — Review audit logs, application logs, DB query logs.
5. **Remediate** — Deploy fix, rotate compromised secrets.
6. **Recover** — Restore service, verify data integrity.
7. **Post-Incident Review** — Blameless retrospective within 48 hours, document root cause and corrective actions.

### Data Breach Procedure (HIPAA / GDPR)

1. Notify Security Lead and Compliance within 1 hour of confirmed breach.
2. Document scope: affected records, data types, root cause.
3. Notify regulatory authority within 72 hours (GDPR Art. 33).
4. Notify affected individuals without undue delay.
5. File full incident report with corrective action plan.

---

## 15. SLAs & SLOs

> **Note:** Targets below are for production environment. Adjust for staging/dev as appropriate.

| Metric                          | Target        | Measurement                          |
|---------------------------------|---------------|--------------------------------------|
| **Availability**                | 99.9%         | Health check uptime over 30-day window |
| **API Response Time (p95)**     | < 500 ms      | Application logs, APM                |
| **API Response Time (p99)**     | < 2 s         | Application logs, APM                |
| **Deployment Frequency**        | ≥ 1/week      | CI/CD pipeline runs                  |
| **Mean Time to Recovery (MTTR)**| < 4 hours     | Incident response logs               |
| **Failed Deployment Rate**      | < 5%          | CI/CD pipeline failure rate          |
| **Test Coverage (backend)**     | ≥ 80%         | Codecov reports                      |

---

## 16. Change Management

### Standard Change Process

1. Create feature branch from `main`.
2. Implement changes with tests.
3. Open Pull Request — requires:
   - Code review (minimum 1 approver)
   - CI pipeline pass (tests, lint, security audit)
   - No critical/high vulnerabilities introduced
4. Merge to `main` triggers CI build.
5. Deploy to staging for verification.
6. Production deploy with manual approval.

### Database Change Rules

1. Schema migrations must be backward-compatible.
2. Never drop columns in the same release that removes code references.
3. Use `ON CONFLICT` clauses for idempotent operations.
4. All schema changes require review by DevOps Lead.

### Emergency Change Process

1. Emergency fixes bypass normal PR process but require:
   - Post-merge review within 24 hours.
   - Incident ticket linked to the change.
   - Post-incident retrospective.

---

## 17. Runbooks & Troubleshooting

### Quick Start (Local Development)

```powershell
# One-command setup
.\scripts\dev-bootstrap.ps1

# Manual setup
cd backend && npm ci && npm run dev
cd frontend && npm ci && npm start
```

### Common Issues

| Problem                          | Diagnosis                              | Resolution                                  |
|----------------------------------|----------------------------------------|---------------------------------------------|
| Backend container unhealthy      | `docker logs healthcare_backend_dev`   | Check DB connectivity, env vars             |
| DB connection refused            | Verify `DB_HOST`, `DB_PORT` in `.env`  | Ensure DB is running, correct credentials   |
| DB SSL error                     | `server does not support SSL`          | Set `DB_SSL=false` or check Supabase config |
| Port already in use              | `netstat -ano \| findstr :5000`        | Kill conflicting process                     |
| Migration failure                | Check `_migrations` table              | Fix migration SQL, re-run orchestrator      |
| Frontend can't reach API         | Check `REACT_APP_API_URL` in env       | Ensure backend is running on correct port   |
| Docker daemon not running        | `docker info` returns error            | Start Docker Desktop, wait for engine ready |
| npm ci fails                     | Check Node.js version                  | Requires Node.js ≥ 18                       |

### Useful Commands

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View backend logs
docker logs healthcare_backend_dev --tail=50

# Validate environment
node scripts/validate-env.js --env dev

# Run migrations
npm run db:migrate

# Run seed
npm run db:seed

# Run tests
cd backend && npm test
```

Full environment runbook: [docs/devops/environment-matrix-runbook.md](docs/devops/environment-matrix-runbook.md)

---

## 18. References & Supporting Documents

| Document                          | Path                                                                 | Description                                  |
|-----------------------------------|----------------------------------------------------------------------|----------------------------------------------|
| Threat Model                      | [docs/devops/threat-model.md](docs/devops/threat-model.md)          | STRIDE-based threat analysis                 |
| Data Classification Policy        | [docs/devops/data-classification.md](docs/devops/data-classification.md) | PHI/PII classification and controls      |
| Logging & Threat Coverage Matrix  | [docs/devops/logging-threat-coverage.md](docs/devops/logging-threat-coverage.md) | Threat-to-logging mapping          |
| Environment Matrix & Runbook      | [docs/devops/environment-matrix-runbook.md](docs/devops/environment-matrix-runbook.md) | Per-env config and startup guide   |
| Backend CI Workflow               | [.github/workflows/backend-ci.yml](.github/workflows/backend-ci.yml) | Backend CI pipeline definition              |
| Frontend CI Workflow              | [.github/workflows/frontend-ci.yml](.github/workflows/frontend-ci.yml) | Frontend CI pipeline definition           |
| README                            | [README.md](README.md)                                               | Project overview and quick start            |

---

*End of Document*
