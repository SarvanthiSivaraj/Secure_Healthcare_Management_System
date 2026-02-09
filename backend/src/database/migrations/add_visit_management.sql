-- Migration: Add Visit Management Tables
-- Purpose: Enable patients to join hospitals via code and admins to manage visits
-- Date: 2026-02-09

-- 1. Add hospital_code to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS hospital_code VARCHAR(6);

-- 2. Generate codes for existing organizations (simple sequence for now)
UPDATE organizations 
SET hospital_code = '10000' || (row_number() OVER (ORDER BY created_at))::text
WHERE hospital_code IS NULL;

-- 3. Add constraints
ALTER TABLE organizations 
ADD CONSTRAINT unique_hospital_code UNIQUE (hospital_code),
ALTER COLUMN hospital_code SET NOT NULL;

-- 4. Create Visits Table
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
    type VARCHAR(50) DEFAULT 'walk_in' CHECK (type IN ('walk_in', 'emergency', 'appointment', 'referral')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    reason TEXT,
    symptoms TEXT,
    
    -- Assignment
    assigned_doctor_id UUID REFERENCES users(id),
    assigned_nurse_id UUID REFERENCES users(id),
    
    -- Timestamps
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexes
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_org ON visits(organization_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_doctor ON visits(assigned_doctor_id);

-- 6. Trigger for updated_at
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Visit Management tables created';
END $$;
