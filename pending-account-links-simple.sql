-- Simple version of pending account links table
-- This creates the table without complex RLS policies that might be causing issues

-- Drop table if it exists (clean slate)
DROP TABLE IF EXISTS pending_account_links CASCADE;

-- Create the table
CREATE TABLE pending_account_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for cleanup
CREATE INDEX idx_pending_account_links_expires_at ON pending_account_links(expires_at);
CREATE INDEX idx_pending_account_links_token ON pending_account_links(token);
CREATE INDEX idx_pending_account_links_email ON pending_account_links(user_email);

-- Create function to clean up expired links
CREATE OR REPLACE FUNCTION cleanup_expired_pending_links()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_account_links WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: RLS policies removed for simplicity - this table will be managed server-side only 