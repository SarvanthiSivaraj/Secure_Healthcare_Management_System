-- Phase 1: Staff & Doctor Management Schema
-- Safe migration that adds new tables and extends users table without breaking existing functionality

-- ============================================================================
-- 1. Extend users table with account management fields
-- ============================================================================

-- Add account status columns (all nullable with defaults for backward compatibility)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_verification')),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Update existing users to have active status
UPDATE users 
SET account_status = 'active', 
    verification_status = 'unverified'
WHERE account_status IS NULL;

-- Create index for account status queries
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- ============================================================================
-- 2. Create verification_documents table for doctor license uploads
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('medical_license', 'identity_proof', 'qualification_certificate', 'other')),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Verification status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin review information
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Metadata
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for verification documents
CREATE INDEX IF NOT EXISTS idx_verification_docs_user ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_verification_docs_type ON verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_verification_docs_reviewed_by ON verification_documents(reviewed_by);

-- ============================================================================
-- 3. Create staff_invitations table for email-based onboarding
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Invitation details
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'nurse', 'lab_technician', 'radiologist', 'pharmacist', 'admin')),
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Inviter information
    invited_by UUID NOT NULL REFERENCES users(id),
    invitation_message TEXT,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    
    -- Acceptance tracking
    accepted_by UUID REFERENCES users(id),
    accepted_at TIMESTAMP,
    
    -- Expiration
    expires_at TIMESTAMP NOT NULL,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for staff invitations
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON staff_invitations(token);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON staff_invitations(status);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_invited_by ON staff_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_expires_at ON staff_invitations(expires_at);

-- ============================================================================
-- 4. Create account_actions table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target user
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Action details
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('suspend', 'activate', 'verify', 'reject', 'invite', 'cancel_invite')),
    action_by UUID NOT NULL REFERENCES users(id),
    
    -- Action metadata
    reason TEXT,
    notes TEXT,
    metadata JSONB,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for account actions
CREATE INDEX IF NOT EXISTS idx_account_actions_user ON account_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_actions_type ON account_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_account_actions_by ON account_actions(action_by);
CREATE INDEX IF NOT EXISTS idx_account_actions_created ON account_actions(created_at DESC);

-- ============================================================================
-- 5. Create triggers for updated_at timestamps
-- ============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to verification_documents
DROP TRIGGER IF EXISTS update_verification_documents_updated_at ON verification_documents;
CREATE TRIGGER update_verification_documents_updated_at
    BEFORE UPDATE ON verification_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to staff_invitations
DROP TRIGGER IF EXISTS update_staff_invitations_updated_at ON staff_invitations;
CREATE TRIGGER update_staff_invitations_updated_at
    BEFORE UPDATE ON staff_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Add comments for documentation
-- ============================================================================

COMMENT ON TABLE verification_documents IS 'Stores doctor license and qualification documents for verification';
COMMENT ON TABLE staff_invitations IS 'Manages email-based staff invitation workflow with token expiration';
COMMENT ON TABLE account_actions IS 'Audit trail for all account management actions (suspend, verify, etc.)';

COMMENT ON COLUMN users.account_status IS 'Current account status: active, suspended, or pending_verification';
COMMENT ON COLUMN users.verification_status IS 'Doctor verification status: unverified, pending, verified, or rejected';

-- ============================================================================
-- Migration complete
-- ============================================================================

SELECT 'Phase 1 Staff Management Schema Migration Complete' AS status;
