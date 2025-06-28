-- COMPLETE SPACE FORUM DATA - Replace all existing sample data
-- Run this in Supabase SQL Editor

-- Clear existing sample data
DELETE FROM replies WHERE TRUE;
DELETE FROM posts WHERE TRUE;  
DELETE FROM categories WHERE TRUE;

-- Insert space-focused categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('Space Missions & Exploration', 'space-missions', 'Current and upcoming space missions, launches, and exploration programs', '#3B82F6', '🚀', 1),
('Astronomy & Astrophysics', 'astronomy', 'Stars, galaxies, black holes, exoplanets, and cosmic phenomena', '#8B5CF6', '🌌', 2),
('Space Technology & Engineering', 'space-tech', 'Rockets, spacecraft, propulsion systems, and space technology', '#10B981', '⚙️', 3),
('SETI & Astrobiology', 'seti-astrobiology', 'Search for extraterrestrial life and astrobiology discussions', '#F59E0B', '👽', 4),
('Science Fiction & Media', 'sci-fi-media', 'Books, movies, TV shows, games, and science fiction', '#EC4899', '📚', 5),
('Off-Topic & General', 'off-topic', 'Introductions and non-space discussions', '#6B7280', '💬', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert realistic posts
DO $$
DECLARE
    sample_user_id UUID;
    missions_cat UUID; astronomy_cat UUID; tech_cat UUID; seti_cat UUID; scifi_cat UUID; general_cat UUID;
BEGIN
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    SELECT id INTO missions_cat FROM categories WHERE slug = 'space-missions';
    SELECT id INTO astronomy_cat FROM categories WHERE slug = 'astronomy';
    SELECT id INTO tech_cat FROM categories WHERE slug = 'space-tech';
    SELECT id INTO seti_cat FROM categories WHERE slug = 'seti-astrobiology';
    SELECT id INTO scifi_cat FROM categories WHERE slug = 'sci-fi-media';
    SELECT id INTO general_cat FROM categories WHERE slug = 'off-topic';
    
    INSERT INTO posts (title, slug, content, author_id, category_id, created_at, view_count, like_count, reply_count) VALUES
    -- Space Missions
    ('Artemis III delayed to 2026 - thoughts on the timeline?', 'artemis-iii-delayed-2026-' || floor(random() * 1000), 'NASA pushed back Artemis III again to September 2026. Getting frustrated with delays but understand the complexity. What''s everyone''s realistic take on when we''ll see boots on the moon again?', sample_user_id, missions_cat, NOW() - INTERVAL '2 days', 234, 28, 12),
    ('Europa Clipper launch - most exciting mission right now?', 'europa-clipper-launch-exciting-' || floor(random() * 1000), 'Europa Clipper finally launched! I''m more excited about this than anything else NASA has planned. The potential for finding signs of life in Europa''s subsurface ocean is incredible. What are you most excited to learn?', sample_user_id, missions_cat, NOW() - INTERVAL '1 day', 189, 24, 8),
    ('SpaceX IFT-5 success - what''s next for Starship?', 'spacex-ift5-success-starship-next-' || floor(random() * 1000), 'That chopstick catch was absolutely insane! Watching those mechanical arms grab a 200-foot rocket booster out of the sky... we''re living in the future. What do you think the timeline looks like for orbital refueling tests?', sample_user_id, missions_cat, NOW() - INTERVAL '6 hours', 156, 31, 15),
    
    -- Astronomy  
    ('JWST Crab Nebula image blew my mind', 'jwst-crab-nebula-mind-blown-' || floor(random() * 1000), 'That recent JWST image of the Crab Nebula in infrared... I literally got chills. You can see structure and detail that was completely invisible before. It''s like getting glasses for the first time, but for the entire universe.', sample_user_id, astronomy_cat, NOW() - INTERVAL '3 days', 178, 22, 9),
    ('Astrophotography gear recommendations for beginner?', 'astrophotography-gear-beginner-' || floor(random() * 1000), 'Ready to upgrade from DSLR + tripod to actual deep space imaging. Budget around $2500. Live in Bortle 6 zone but willing to drive to darker sites. What would you prioritize - tracking mount vs telescope vs camera?', sample_user_id, astronomy_cat, NOW() - INTERVAL '12 hours', 167, 18, 23),
    ('Betelgeuse still acting weird - supernova watch?', 'betelgeuse-weird-supernova-watch-' || floor(random() * 1000), 'Betelgeuse has been dimming and brightening irregularly for years now. I know it could go supernova anytime in the next 100,000 years, but all this activity has me wondering... are we seeing the prelude to something spectacular?', sample_user_id, astronomy_cat, NOW() - INTERVAL '4 hours', 143, 16, 7),
    
    -- Space Tech
    ('Raptor 3 engine specs - game changer?', 'raptor-3-engine-specs-changer-' || floor(random() * 1000), 'SpaceX released Raptor 3 specs: 350 bar chamber pressure, 280tf vacuum thrust. That pressure is approaching theoretical limits for methane combustion. Manufacturing simplification is impressive too. Thoughts from the propulsion nerds?', sample_user_id, tech_cat, NOW() - INTERVAL '1 day', 198, 26, 11),
    ('Nuclear thermal propulsion for Mars - finally happening?', 'nuclear-thermal-mars-finally-' || floor(random() * 1000), 'NASA and DARPA are actually moving forward with DRACO nuclear thermal rocket program. Could cut Mars transit time to 3-4 months instead of 6-9. The technology has existed since the 70s - what took so long?', sample_user_id, tech_cat, NOW() - INTERVAL '8 hours', 134, 19, 6),
    
    -- SETI/Astrobiology
    ('Breakthrough Listen project - are we looking wrong?', 'breakthrough-listen-looking-wrong-' || floor(random() * 1000), 'Been following Breakthrough Listen for years. They''re scanning the nearest million stars, but what if advanced civilizations moved beyond radio entirely? Maybe we''re looking for smoke signals while they''re using quantum entanglement.', sample_user_id, seti_cat, NOW() - INTERVAL '2 days', 156, 21, 8),
    ('Phosphine on Venus - still controversial?', 'phosphine-venus-still-controversial-' || floor(random() * 1000), 'Remember the phosphine detection on Venus in 2020? Studies keep going back and forth. Latest analysis suggests it might be sulfur dioxide instead. But what if there really are microbes in Venus'' clouds? Would change everything.', sample_user_id, seti_cat, NOW() - INTERVAL '5 hours', 112, 14, 5),
    
    -- Sci-Fi Media
    ('The Expanse vs reality - how accurate?', 'expanse-vs-reality-accurate-' || floor(random() * 1000), 'Third rewatch of The Expanse and amazed by the realism. Thrust gravity, orbital mechanics, space politics all feel plausible. The Epstein Drive is magic, but everything else is surprisingly hard science fiction. What other shows get space right?', sample_user_id, scifi_cat, NOW() - INTERVAL '1 day', 203, 29, 18),
    ('Foundation on Apple TV - worth watching?', 'foundation-apple-tv-worth-' || floor(random() * 1000), 'Started Foundation on Apple TV after loving the Asimov books. The visuals are incredible but they changed a lot from the source material. Anyone else watching? How do you feel about the adaptations they made?', sample_user_id, scifi_cat, NOW() - INTERVAL '3 hours', 87, 12, 14),
    
    -- General/Welcome
    ('Welcome space nerds! Introduce yourself 🚀', 'welcome-space-nerds-intro-' || floor(random() * 1000), 'Hey everyone! Welcome to our corner of the internet for space enthusiasts and astronomy geeks. Whether you stay up late for rocket launches or dream about humanity becoming spacefaring - you''re in the right place!

Guidelines:
- Be kind and respectful
- Share your excitement freely  
- Back up claims with sources
- No question is too basic

I''ll start: Software engineer by day, amateur astronomer by night. Got hooked watching Space Shuttle launches as a kid. What''s your space origin story?', sample_user_id, general_cat, NOW() - INTERVAL '5 days', 412, 67, 32);

END $$;

-- Add sample replies to make it feel active
DO $$
DECLARE
    sample_user_id UUID;
    welcome_post_id UUID;
    artemis_post_id UUID;
    jwst_post_id UUID;
BEGIN
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    SELECT id INTO welcome_post_id FROM posts WHERE title LIKE 'Welcome space nerds!%' LIMIT 1;
    SELECT id INTO artemis_post_id FROM posts WHERE title LIKE 'Artemis III delayed%' LIMIT 1;
    SELECT id INTO jwst_post_id FROM posts WHERE title LIKE 'JWST Crab Nebula%' LIMIT 1;
    
    -- Welcome post replies
    INSERT INTO replies (content, author_id, post_id, created_at) VALUES
    ('Aerospace engineer here! My obsession started watching Apollo 11 footage as a kid. That "one small step" moment still gives me chills. Most excited about the upcoming lunar missions!', sample_user_id, welcome_post_id, NOW() - INTERVAL '4 days'),
    ('High school physics teacher and astrophotographer. Got hooked seeing Saturn through a telescope - those rings are magical! Love sharing the wonder with students.', sample_user_id, welcome_post_id, NOW() - INTERVAL '3 days'),
    ('Grad student studying exoplanet atmospheres. Fascinated since learning there might be billions of Earth-like planets. JWST discoveries have been incredible for my field!', sample_user_id, welcome_post_id, NOW() - INTERVAL '2 days'),
    ('Retired NASA contractor - worked Space Shuttle mission planning for 20 years. Happy to share behind-the-scenes stories! Current commercial space boom feels like the shuttle days.', sample_user_id, welcome_post_id, NOW() - INTERVAL '1 day'),
    ('Just a regular person who gets way too excited about launches. Woke up at 3 AM for Europa Clipper and zero regrets! This community seems awesome.', sample_user_id, welcome_post_id, NOW() - INTERVAL '12 hours'),
    
    -- Artemis post replies
    ('Honestly think 2027 is more realistic. SpaceX HLS is progressing well but lunar operations are complex. Rather have it delayed and done right than rushed.', sample_user_id, artemis_post_id, NOW() - INTERVAL '1 day'),
    ('The spacesuit delays are what worry me most. You can''t exactly do EVAs on the moon in a t-shirt! Axiom better get their act together.', sample_user_id, artemis_post_id, NOW() - INTERVAL '18 hours'),
    
    -- JWST post replies
    ('Same here! The level of detail is just unreal. Makes me wonder what else we''ve been missing all these years.', sample_user_id, jwst_post_id, NOW() - INTERVAL '2 days'),
    ('Wait until you see the galaxy formation images. We''re literally watching the universe grow up!', sample_user_id, jwst_post_id, NOW() - INTERVAL '1 day');
    
END $$;

-- Update statistics
UPDATE posts SET 
  reply_count = (SELECT COUNT(*) FROM replies WHERE replies.post_id = posts.id AND replies.is_hidden = false),
  last_reply_at = (SELECT GREATEST(posts.created_at, COALESCE(MAX(replies.created_at), posts.created_at)) FROM replies WHERE replies.post_id = posts.id);

UPDATE categories SET
  post_count = (SELECT COUNT(*) FROM posts WHERE posts.category_id = categories.id AND posts.is_hidden = false),
  last_post_at = (SELECT MAX(created_at) FROM posts WHERE posts.category_id = categories.id AND posts.is_hidden = false); 