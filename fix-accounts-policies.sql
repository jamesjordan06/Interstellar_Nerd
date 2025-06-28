-- Fix accounts table policies for NextAuth OAuth functionality
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "System can manage accounts" ON accounts;

-- Create more permissive policies for NextAuth to work properly
CREATE POLICY "Allow NextAuth to manage accounts" ON accounts
    FOR ALL USING (true);

-- Alternative: More restrictive but still functional policies
-- Uncomment these if you want more security (and comment out the one above)
-- CREATE POLICY "Users can view own accounts" ON accounts
--     FOR SELECT USING (auth.uid()::text = user_id::text);

-- CREATE POLICY "System can insert accounts" ON accounts
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "System can update accounts" ON accounts  
--     FOR UPDATE USING (true);

-- CREATE POLICY "System can delete accounts" ON accounts
--     FOR DELETE USING (true); 