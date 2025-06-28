-- Create pending_account_links table for secure OAuth linking
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pending_account_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    provider_email TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at_pending TIMESTAMPTZ NOT NULL,
    verification_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    verified_at TIMESTAMPTZ,
    
    UNIQUE(user_id, provider, provider_account_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_account_links_user_id ON pending_account_links(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_account_links_token ON pending_account_links(verification_token);
CREATE INDEX IF NOT EXISTS idx_pending_account_links_expires ON pending_account_links(expires_at_pending);

-- Row Level Security
ALTER TABLE pending_account_links ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own pending links
CREATE POLICY "Users can view own pending links" ON pending_account_links
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- System can manage pending links
CREATE POLICY "System can manage pending links" ON pending_account_links
    FOR ALL USING (true);

-- Function to clean up expired pending links
CREATE OR REPLACE FUNCTION cleanup_expired_pending_links()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_account_links 
    WHERE expires_at_pending < NOW() AND verified_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_pending_links() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_pending_links() TO service_role; 