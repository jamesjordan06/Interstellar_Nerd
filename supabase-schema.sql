-- =====================================================
-- INTERSTELLAR NERD FORUM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This script creates all tables, relationships, indexes, and policies
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (Authentication & Profiles)
-- =====================================================
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255), -- NULL for OAuth-only users
    avatar_url TEXT,
    bio TEXT,
    email_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ACCOUNTS TABLE (OAuth Account Linking)
-- =====================================================
CREATE TABLE accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'credentials', etc.
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- =====================================================
-- 3. CATEGORIES TABLE (Forum Categories)
-- =====================================================
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for category
    icon VARCHAR(50), -- Icon name for UI
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    last_post_at TIMESTAMP WITH TIME ZONE,
    last_post_user_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. POSTS TABLE (Forum Posts/Topics)
-- =====================================================
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT, -- Auto-generated from content
    author_id UUID NOT NULL REFERENCES users(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    hide_reason TEXT,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. REPLIES TABLE (Post Replies/Comments)
-- =====================================================
CREATE TABLE replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES replies(id), -- For nested replies
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    hide_reason TEXT,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0, -- For nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. LIKES TABLE (Post & Reply Likes)
-- =====================================================
CREATE TABLE likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, reply_id),
    CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- =====================================================
-- 7. BOOKMARKS TABLE (User Bookmarks)
-- =====================================================
CREATE TABLE bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- =====================================================
-- 8. FOLLOWS TABLE (User Following)
-- =====================================================
CREATE TABLE follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES users(id),
    following_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- =====================================================
-- 9. NOTIFICATIONS TABLE (User Notifications)
-- =====================================================
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'reply', 'like', 'follow', 'mention'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    post_id UUID REFERENCES posts(id),
    reply_id UUID REFERENCES replies(id),
    from_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. REPORTS TABLE (Content Reports)
-- =====================================================
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id),
    post_id UUID REFERENCES posts(id),
    reply_id UUID REFERENCES replies(id),
    user_id UUID REFERENCES users(id), -- Reported user
    type VARCHAR(50) NOT NULL, -- 'spam', 'inappropriate', 'harassment', etc.
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK ((post_id IS NOT NULL) OR (reply_id IS NOT NULL) OR (user_id IS NOT NULL))
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_seen_at ON users(last_seen_at);

-- Accounts indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Posts indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_last_reply_at ON posts(last_reply_at DESC);
CREATE INDEX idx_posts_pinned_created ON posts(is_pinned DESC, created_at DESC);
CREATE INDEX idx_posts_category_pinned_last_reply ON posts(category_id, is_pinned DESC, last_reply_at DESC);

-- Replies indexes
CREATE INDEX idx_replies_post_id ON replies(post_id);
CREATE INDEX idx_replies_author_id ON replies(author_id);
CREATE INDEX idx_replies_parent_id ON replies(parent_id);
CREATE INDEX idx_replies_created_at ON replies(created_at);

-- Likes indexes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_reply_id ON likes(reply_id);

-- Bookmarks indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);

-- Follows indexes
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Reports indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (NOT is_banned);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- ACCOUNTS POLICIES
CREATE POLICY "Users can view own accounts" ON accounts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can manage accounts" ON accounts
    FOR ALL USING (true); -- NextAuth needs full access

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view public categories" ON categories
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.is_admin = true
        )
    );

-- POSTS POLICIES
CREATE POLICY "Anyone can view non-hidden posts" ON posts
    FOR SELECT USING (NOT is_hidden);

CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND NOT users.is_banned
        )
    );

CREATE POLICY "Authors can update own posts" ON posts
    FOR UPDATE USING (
        auth.uid()::text = author_id::text AND
        NOT is_locked
    );

CREATE POLICY "Moderators can manage posts" ON posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND (users.is_admin = true OR users.is_moderator = true)
        )
    );

-- REPLIES POLICIES
CREATE POLICY "Anyone can view non-hidden replies" ON replies
    FOR SELECT USING (NOT is_hidden);

CREATE POLICY "Authenticated users can create replies" ON replies
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND NOT users.is_banned
        )
    );

CREATE POLICY "Authors can update own replies" ON replies
    FOR UPDATE USING (auth.uid()::text = author_id::text);

CREATE POLICY "Moderators can manage replies" ON replies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND (users.is_admin = true OR users.is_moderator = true)
        )
    );

-- LIKES POLICIES
CREATE POLICY "Anyone can view likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL USING (auth.uid()::text = user_id::text);

-- BOOKMARKS POLICIES
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid()::text = user_id::text);

-- FOLLOWS POLICIES
CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON follows
    FOR ALL USING (auth.uid()::text = follower_id::text);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- REPORTS POLICIES
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid()::text = reporter_id::text);

CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid()::text = reporter_id::text);

CREATE POLICY "Moderators can manage reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND (users.is_admin = true OR users.is_moderator = true)
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replies_updated_at BEFORE UPDATE ON replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS FOR MAINTAINING COUNTS
-- =====================================================

-- Function to update post reply count
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET reply_count = reply_count + 1,
            last_reply_at = NEW.created_at,
            last_reply_user_id = NEW.author_id
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET reply_count = reply_count - 1
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_post_reply_count
    AFTER INSERT OR DELETE ON replies
    FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.reply_id IS NOT NULL THEN
            UPDATE replies SET like_count = like_count + 1 WHERE id = NEW.reply_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        ELSIF OLD.reply_id IS NOT NULL THEN
            UPDATE replies SET like_count = like_count - 1 WHERE id = OLD.reply_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- Function to update category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories 
        SET post_count = post_count + 1,
            last_post_at = NEW.created_at,
            last_post_user_id = NEW.author_id
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET post_count = post_count - 1
        WHERE id = OLD.category_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_category_post_count
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Create default categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('General Discussion', 'general', 'General forum discussions and introductions', '#3B82F6', '💬', 1),
('Space & Astronomy', 'space-astronomy', 'Discussions about space exploration, astronomy, and the cosmos', '#8B5CF6', '🚀', 2),
('Technology', 'technology', 'Latest tech news, gadgets, and innovations', '#10B981', '💻', 3),
('Science Fiction', 'sci-fi', 'Science fiction books, movies, and discussions', '#F59E0B', '🛸', 4),
('Gaming', 'gaming', 'Video games, board games, and gaming culture', '#EF4444', '🎮', 5),
('Off Topic', 'off-topic', 'Anything else that doesn''t fit in other categories', '#6B7280', '🎲', 6);

-- =====================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for posts with author and category info
CREATE VIEW posts_with_details AS
SELECT 
    p.*,
    u.name as author_name,
    u.username as author_username,
    u.avatar_url as author_avatar,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN categories c ON p.category_id = c.id;

-- View for replies with author info
CREATE VIEW replies_with_details AS
SELECT 
    r.*,
    u.name as author_name,
    u.username as author_username,
    u.avatar_url as author_avatar
FROM replies r
JOIN users u ON r.author_id = u.id;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get user's post count
CREATE OR REPLACE FUNCTION get_user_post_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM posts WHERE author_id = user_uuid AND NOT is_hidden);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's reply count
CREATE OR REPLACE FUNCTION get_user_reply_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM replies WHERE author_id = user_uuid AND NOT is_hidden);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user liked a post
CREATE OR REPLACE FUNCTION user_liked_post(user_uuid UUID, post_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM likes WHERE user_id = user_uuid AND post_id = post_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user bookmarked a post
CREATE OR REPLACE FUNCTION user_bookmarked_post(user_uuid UUID, post_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM bookmarks WHERE user_id = user_uuid AND post_id = post_uuid);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETED SCHEMA SETUP
-- =====================================================
-- Your forum database is now ready with:
-- ✅ User authentication & profiles
-- ✅ OAuth account linking
-- ✅ Forum categories & posts
-- ✅ Replies & nested comments
-- ✅ Likes & bookmarks system
-- ✅ User following system
-- ✅ Notifications system
-- ✅ Content reporting & moderation
-- ✅ All relationships & foreign keys
-- ✅ Performance indexes
-- ✅ Row Level Security policies
-- ✅ Auto-updating triggers
-- ✅ Helper functions & views
-- ✅ Default categories 