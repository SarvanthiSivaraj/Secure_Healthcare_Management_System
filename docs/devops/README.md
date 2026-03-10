## Security Scanning (Trivy)

```bash
# Install
choco install trivy  # Windows
brew install trivy   # macOS

# Run scan
.\scripts\security-scan.ps1

# Scan specific target
.\scripts\security-scan.ps1 -Target filesystem -Severity CRITICAL
```

Scans run automatically in CI/CD. Results in GitHub Security tab.

## Monitoring Stack

```bash
# Start application
docker compose -f docker-compose.dev.yaml up -d

# Start monitoring
docker compose -f docker-compose.monitoring.yaml up -d
```

**Access:**
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Metrics: http://localhost:5000/metrics

**Dashboards:** Pre-configured in Grafana → Healthcare System Overview

## Configuration Files

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Scrape config
│   └── alerts/*.yml            # Alert rules
├── grafana/provisioning/       # Auto-loaded dashboards
└── exporters/                  # Custom metric queries

.github/workflows/
└── security-scan.yml           # Automated security scanning
```

## Common Commands

```bash
# View logs
docker logs healthcare_prometheus -f
docker logs healthcare_grafana -f

# Restart services
docker compose -f docker-compose.monitoring.yaml restart

# Stop all
docker compose -f docker-compose.monitoring.yaml down
docker compose -f docker-compose.dev.yaml down
```

## Alerts

Critical alerts configured for:
- Service downtime
- High error rates (>5%)
- Failed logins (security)
- Audit log failures (HIPAA)

View: http://localhost:9090/alerts

## HIPAA Compliance

- ✅ Automated security scans (daily)
- ✅ Metrics retention (30 days)
- ✅ Audit trail monitoring
- ✅ PHI access tracking

**SLA:** Critical vulnerabilities fixed within 24h.

---

For detailed configs, see the actual YAML files. They're well-commented.
