-- ============================================
-- Epic 4: Clinical Workflow Schema
-- Healthcare Management System
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENHANCE VISITS TABLE
-- ============================================
ALTER TABLE visits ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT 'scheduled';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS no_show_at TIMESTAMP;

-- ============================================
-- CARE TEAM ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS care_team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    staff_user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL, -- 'primary_doctor', 'consulting_doctor', 'nurse', 'specialist', 'anesthesiologist'
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    removed_at TIMESTAMP,
    removed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LAB ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    ordered_by UUID NOT NULL REFERENCES users(id),
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(50),
    test_category VARCHAR(100), -- 'hematology', 'biochemistry', 'microbiology', 'pathology'
    priority VARCHAR(20) DEFAULT 'routine', -- 'stat', 'urgent', 'routine'
    status VARCHAR(50) DEFAULT 'ordered', -- 'ordered', 'collected', 'in_progress', 'completed', 'cancelled'
    routed_to_department VARCHAR(100),
    specimen_collected_at TIMESTAMP,
    result_available_at TIMESTAMP,
    lab_result_id UUID REFERENCES lab_results(id),
    clinical_indication TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- IMAGING ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS imaging_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    ordered_by UUID NOT NULL REFERENCES users(id),
    imaging_type VARCHAR(100) NOT NULL, -- 'X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Mammography'
    body_part VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'routine', -- 'stat', 'urgent', 'routine'
    status VARCHAR(50) DEFAULT 'ordered', -- 'ordered', 'scheduled', 'in_progress', 'completed', 'cancelled'
    routed_to_department VARCHAR(100),
    scheduled_time TIMESTAMP,
    performed_at TIMESTAMP,
    imaging_report_id UUID REFERENCES imaging_reports(id),
    clinical_indication TEXT,
    contrast_used BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEDICATION ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medication_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id),
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    route VARCHAR(50) NOT NULL, -- 'oral', 'IV', 'IM', 'subcutaneous', 'topical'
    frequency VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ordered', -- 'ordered', 'dispensed', 'administered', 'discontinued', 'held'
    ordered_by UUID NOT NULL REFERENCES users(id),
    dispensed_by UUID REFERENCES users(id),
    dispensed_at TIMESTAMP,
    administered_by UUID REFERENCES users(id),
    administered_at TIMESTAMP,
    discontinued_by UUID REFERENCES users(id),
    discontinued_at TIMESTAMP,
    discontinuation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'lab_result', 'imaging_report', 'medication_due', 'visit_update', 'care_team', 'bed_assignment'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    channels JSONB DEFAULT '["in_app"]'::jsonb, -- ['in_app', 'email', 'sms']
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    related_entity_type VARCHAR(50), -- 'visit', 'lab_order', 'imaging_order', 'medication_order', 'bed_allocation'
    related_entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BED ALLOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bed_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    ward VARCHAR(100) NOT NULL,
    room VARCHAR(50) NOT NULL,
    bed VARCHAR(50) NOT NULL,
    bed_type VARCHAR(50), -- 'general', 'ICU', 'isolation', 'pediatric', 'maternity'
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allocated_by UUID NOT NULL REFERENCES users(id),
    released_at TIMESTAMP,
    released_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'occupied', -- 'occupied', 'released', 'cleaning', 'maintenance'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORKFLOW LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'visit', 'lab_order', 'imaging_order', 'medication_order', 'care_team', 'bed_allocation'
    entity_id UUID,
    old_state JSONB,
    new_state JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ONE-TIME TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS one_time_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scope JSONB NOT NULL, -- {resource_type, resource_id, permissions}
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    used_by_ip INET,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Care Team Assignments
CREATE INDEX IF NOT EXISTS idx_care_team_visit ON care_team_assignments(visit_id);
CREATE INDEX IF NOT EXISTS idx_care_team_staff ON care_team_assignments(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_care_team_active ON care_team_assignments(visit_id, removed_at) WHERE removed_at IS NULL;

-- Lab Orders
CREATE INDEX IF NOT EXISTS idx_lab_orders_visit ON lab_orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_department ON lab_orders(routed_to_department);
CREATE INDEX IF NOT EXISTS idx_lab_orders_priority ON lab_orders(priority, status);

-- Imaging Orders
CREATE INDEX IF NOT EXISTS idx_imaging_orders_visit ON imaging_orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_status ON imaging_orders(status);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_department ON imaging_orders(routed_to_department);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_type ON imaging_orders(imaging_type, status);

-- Medication Orders
CREATE INDEX IF NOT EXISTS idx_medication_orders_visit ON medication_orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_medication_orders_prescription ON medication_orders(prescription_id);
CREATE INDEX IF NOT EXISTS idx_medication_orders_status ON medication_orders(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(related_entity_type, related_entity_id);

-- Bed Allocations
CREATE INDEX IF NOT EXISTS idx_bed_allocations_visit ON bed_allocations(visit_id);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_location ON bed_allocations(ward, room, bed);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_status ON bed_allocations(status);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_active ON bed_allocations(ward, room, bed, status) WHERE status = 'occupied';

-- Workflow Logs
CREATE INDEX IF NOT EXISTS idx_workflow_logs_visit ON workflow_logs(visit_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_user ON workflow_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_entity ON workflow_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_action ON workflow_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created ON workflow_logs(created_at);

-- One-Time Tokens
CREATE INDEX IF NOT EXISTS idx_one_time_tokens_hash ON one_time_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_one_time_tokens_user ON one_time_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_one_time_tokens_expires ON one_time_tokens(expires_at) WHERE used_at IS NULL;

-- Visit State
CREATE INDEX IF NOT EXISTS idx_visits_state ON visits(state);

-- ============================================
-- CONSTRAINTS
-- ============================================

-- Prevent double bed allocation
CREATE UNIQUE INDEX IF NOT EXISTS idx_bed_unique_allocation 
ON bed_allocations(ward, room, bed) 
WHERE status = 'occupied';

-- Ensure care team role uniqueness per visit
CREATE UNIQUE INDEX IF NOT EXISTS idx_care_team_unique_role 
ON care_team_assignments(visit_id, staff_user_id, role) 
WHERE removed_at IS NULL;
