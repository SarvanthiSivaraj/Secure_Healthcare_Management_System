# ============================================================
# Dev Bootstrap Script (PowerShell)
# ============================================================
# Brings a fresh clone to a healthy dev stack with one command.
#
# Usage:
#   .\scripts\dev-bootstrap.ps1
#   .\scripts\dev-bootstrap.ps1 -SkipDocker   # local npm only
#   .\scripts\dev-bootstrap.ps1 -WithTools     # include pgAdmin
# ============================================================

param(
    [switch]$SkipDocker,
    [switch]$WithTools,
    [switch]$FreshDb
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Resolve project root reliably
if (-not (Test-Path (Join-Path $RootDir "docker-compose.dev.yaml"))) {
    $RootDir = Split-Path -Parent $PSScriptRoot
}
if (-not (Test-Path (Join-Path $RootDir "docker-compose.dev.yaml"))) {
    $RootDir = $PSScriptRoot | Split-Path -Parent
}

Set-Location $RootDir

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Secure Healthcare Management System - Dev Bootstrap" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 1 — Prerequisites
# ───────────────────────────────────────────────────────────

Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow

$prerequisites = @("node", "npm", "docker", "git")
$missing = @()

foreach ($cmd in $prerequisites) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        $missing += $cmd
    }
}

if ($missing.Count -gt 0) {
    Write-Host "  ERROR: Missing prerequisites: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}

$nodeVersion = (node --version) -replace 'v', ''
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 18) {
    Write-Host "  ERROR: Node.js >= 18 required (found v$nodeVersion)" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js v$nodeVersion" -ForegroundColor Green

if (-not $SkipDocker) {
    try {
        docker info | Out-Null
        Write-Host "  Docker is running" -ForegroundColor Green
    }
    catch {
        Write-Host "  ERROR: Docker daemon is not running. Start Docker Desktop and retry." -ForegroundColor Red
        exit 1
    }
}

Write-Host "  All prerequisites OK" -ForegroundColor Green
Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 2 — Environment Setup
# ───────────────────────────────────────────────────────────

Write-Host "[2/7] Checking environment files..." -ForegroundColor Yellow

$backendEnv = Join-Path $RootDir "backend\.env"
$backendEnvExample = Join-Path $RootDir "backend\.env.example"

if (-not (Test-Path $backendEnv)) {
    if (Test-Path $backendEnvExample) {
        Copy-Item $backendEnvExample $backendEnv
        Write-Host "  Created backend\.env from template" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: No backend\.env.example found." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  backend\.env already exists" -ForegroundColor Green
}

# Auto-generate secrets if placeholders found
$envContent = Get-Content $backendEnv -Raw
$needsUpdate = $false

function New-HexSecret($length) {
    return -join ((1..$length) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) })
}

if ($envContent -match "your_64_char_hex_secret_here") {
    $envContent = $envContent -replace "your_64_char_hex_secret_here", (New-HexSecret 64)
    $needsUpdate = $true
}

if ($envContent -match "your_64_char_hex_refresh_secret_here") {
    $envContent = $envContent -replace "your_64_char_hex_refresh_secret_here", (New-HexSecret 64)
    $needsUpdate = $true
}

if ($envContent -match "your_32_char_hex_encryption_key") {
    $envContent = $envContent -replace "your_32_char_hex_encryption_key", (New-HexSecret 32)
    $needsUpdate = $true
}

if ($needsUpdate) {
    Set-Content $backendEnv $envContent -NoNewline
    Write-Host "  Generated development secrets" -ForegroundColor Green
}

Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 3 — Backend Dependencies
# ───────────────────────────────────────────────────────────

Write-Host "[3/7] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location "backend"
npm ci --loglevel warn
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Backend npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Backend dependencies installed" -ForegroundColor Green
Pop-Location
Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 4 — Frontend Dependencies
# ───────────────────────────────────────────────────────────

Write-Host "[4/7] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location "frontend"
npm ci --loglevel warn
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Frontend npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Frontend dependencies installed" -ForegroundColor Green
Pop-Location
Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 5 — Env Validation
# ───────────────────────────────────────────────────────────

Write-Host "[5/7] Validating environment variables..." -ForegroundColor Yellow
node scripts\validate-env.js --env dev
Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 6 — Run Tests
# ───────────────────────────────────────────────────────────

Write-Host "[6/7] Running backend tests..." -ForegroundColor Yellow
Push-Location "backend"
npm test
Pop-Location
Write-Host ""

# ───────────────────────────────────────────────────────────
# STEP 7 — Docker Compose
# ───────────────────────────────────────────────────────────

if (-not $SkipDocker) {
    Write-Host "[7/7] Starting Docker Compose (dev)..." -ForegroundColor Yellow

    if ($FreshDb) {
        docker compose -f docker-compose.dev.yaml down -v
    }

    $composeArgs = @("-f", "docker-compose.dev.yaml", "up", "--build", "-d")
    if ($WithTools) {
        $composeArgs += @("--profile", "tools")
    }

    docker compose @composeArgs
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        Write-Host "  ERROR: Docker Compose failed (exit $exitCode)" -ForegroundColor Red
        exit $exitCode
    }

    Write-Host "  Docker Compose started successfully." -ForegroundColor Green

    Write-Host "  Waiting for backend health..." -ForegroundColor Yellow
    $maxWait = 50
    $waited = 0
    $containerName = "healthcare_backend_dev"

    while ($waited -lt $maxWait) {
        $status = docker inspect --format='{{.State.Health.Status}}' $containerName 2>$null
        if ($status -eq "healthy") {
            Write-Host "  Backend is healthy!" -ForegroundColor Green
            break
        }

        Start-Sleep -Seconds 5
        $waited += 5
        Write-Host "    ... waiting ($waited s)" -ForegroundColor DarkGray
    }

    if ($waited -ge $maxWait) {
        Write-Host "  WARNING: Backend not healthy after $maxWait seconds." -ForegroundColor Yellow
    }
}
else {
    Write-Host "[7/7] Skipping Docker (--SkipDocker flag)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Bootstrap Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:  http://localhost:3000"
Write-Host "API:       http://localhost:5005"
Write-Host "Health:    http://localhost:5005/health"
Write-Host ""