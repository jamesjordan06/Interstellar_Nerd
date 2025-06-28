-- Clean version of pending account links table setup
-- This version handles existing policies gracefully

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own pending links" ON pending_account_links;
DROP POLICY IF EXISTS "Users can insert own pending links" ON pending_account_links;
DROP POLICY IF EXISTS "Users can delete own pending links" ON pending_account_links;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS pending_account_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pending_account_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own pending links" ON pending_account_links
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own pending links" ON pending_account_links
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own pending links" ON pending_account_links
  FOR DELETE USING (user_email = auth.jwt() ->> 'email');

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_pending_account_links_expires_at ON pending_account_links(expires_at);

-- Create function to clean up expired links
CREATE OR REPLACE FUNCTION cleanup_expired_pending_links()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_account_links WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 