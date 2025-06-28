-- INTERSTELLAR NERD FORUM - SPACE-FOCUSED SAMPLE DATA
-- Updated categories and realistic posts for space enthusiasts

-- Clear existing sample data first
DELETE FROM replies WHERE TRUE;
DELETE FROM posts WHERE TRUE;
DELETE FROM categories WHERE TRUE;

-- Insert space-focused categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('Space Missions & Exploration', 'space-missions', 'Discuss current and upcoming space missions, launches, and exploration programs', '#3B82F6', '🚀', 1),
('Astronomy & Astrophysics', 'astronomy', 'Stars, galaxies, black holes, exoplanets, and cosmic phenomena', '#8B5CF6', '🌌', 2),
('Space Technology & Engineering', 'space-tech', 'Rockets, spacecraft, propulsion systems, and space technology developments', '#10B981', '⚙️', 3),
('SETI & Astrobiology', 'seti-astrobiology', 'Search for extraterrestrial life, astrobiology, and the Drake equation', '#F59E0B', '👽', 4),
('Science Fiction & Media', 'sci-fi-media', 'Books, movies, TV shows, games, and science fiction discussions', '#EC4899', '📚', 5),
('Off-Topic & General', 'off-topic', 'Everything else - introduce yourself, random discussions, and non-space topics', '#6B7280', '💬', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert realistic posts with current topics
DO $$
DECLARE
    missions_cat_id UUID;
    astronomy_cat_id UUID;
    tech_cat_id UUID;
    seti_cat_id UUID;
    scifi_cat_id UUID;
    general_cat_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO missions_cat_id FROM categories WHERE slug = 'space-missions';
    SELECT id INTO astronomy_cat_id FROM categories WHERE slug = 'astronomy';
    SELECT id INTO tech_cat_id FROM categories WHERE slug = 'space-tech';
    SELECT id INTO seti_cat_id FROM categories WHERE slug = 'seti-astrobiology';
    SELECT id INTO scifi_cat_id FROM categories WHERE slug = 'sci-fi-media';
    SELECT id INTO general_cat_id FROM categories WHERE slug = 'off-topic';
    
    -- Get a sample user
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Insert realistic posts
    INSERT INTO posts (title, slug, content, author_id, category_id, created_at, view_count, like_count, reply_count) VALUES
    (
        'Artemis III Moon Landing - Realistic Timeline Discussion',
        'artemis-iii-moon-landing-timeline-' || extract(epoch from now())::text,
        'So NASA just pushed back Artemis III again to September 2026. I''m honestly getting a bit frustrated with these delays, but I understand the complexity involved.

What''s everyone''s realistic take on when we''ll actually see boots on the moon again? The heat shield issues with Orion seem mostly resolved, but now I''m hearing about spacesuit delays and concerns about the HLS (Human Landing System) integration.

Part of me wonders if we should''ve stuck with a simpler approach instead of the complex Gateway architecture. Don''t get me wrong - I''m all for ambitious projects, but sometimes I feel like we''re over-engineering this.

Anyone else following the SpaceX HLS development closely? Their Starship tests have been impressive lately, but lunar operations are a whole different beast.',
        sample_user_id,
        missions_cat_id,
        NOW() - INTERVAL '2 days',
        234,
        28,
        15
    ),
    (
        'JWST vs Hubble: The images that changed my perspective',
        'jwst-vs-hubble-perspective-change-' || extract(epoch from now())::text,
        'I''ve been an amateur astronomer for about 15 years, and I thought I''d seen it all with Hubble. But honestly, JWST has completely blown me away.

That recent image of the Crab Nebula in infrared... I literally got chills. You can see structure and detail that was completely invisible before. It''s like getting glasses for the first time, but for the entire universe.

My favorite so far has to be the deep field comparisons. Seeing galaxies that formed just a few hundred million years after the Big Bang is just mind-boggling. We''re literally looking at baby photos of the universe.

Anyone else feel like we''re living in a golden age of astronomy right now? Between JWST, the Event Horizon Telescope, and all the ground-based surveys, it feels like we''re making major discoveries every month.',
        sample_user_id,
        astronomy_cat_id,
        NOW() - INTERVAL '1 day',
        189,
        31,
        22
    ),
    (
        'SpaceX Raptor 3 Engine: Game changer or incremental improvement?',
        'spacex-raptor-3-engine-analysis-' || extract(epoch from now())::text,
        'Elon just tweeted some specs about the Raptor 3 engine and I''m trying to wrap my head around the improvements. 350 bar chamber pressure is absolutely insane - that''s approaching theoretical limits for methane combustion.

The thrust increase to 280tf (vacuum) is impressive, but what really gets me excited is the supposed manufacturing simplification. If they can really build these faster and cheaper while increasing performance, that''s the holy grail of rocket engineering.

I''m curious about the reliability implications though. Higher chamber pressure usually means more stress on components. Has anyone seen detailed analysis of the new design?

Also wondering how this affects the Starship architecture. More thrust per engine means they could potentially reduce the number of engines, which would simplify the whole system. But then again, engine-out capability becomes more critical.

Thoughts from the propulsion nerds in here?',
        sample_user_id,
        tech_cat_id,
        NOW() - INTERVAL '6 hours',
        156,
        19,
        11
    ),
    (
        'Europa Clipper Launch - What are you most excited to learn?',
        'europa-clipper-launch-excitement-' || extract(epoch from now())::text,
        'Europa Clipper finally launched last month and I''m honestly more excited about this mission than anything else NASA has planned. The potential for finding signs of life in Europa''s subsurface ocean is just incredible.

What I''m most curious about:
- The ice shell thickness mapping - are there really thin spots where we could potentially drill through?
- Organic compound detection in the plumes - imagine if we find complex organics!
- The magnetic field measurements - understanding that ocean better

I know we won''t get definitive "life found" results, but even confirming the habitability would be huge. The fact that this ocean might have more water than all of Earth''s oceans combined just blows my mind.

Anyone else think this could be the mission that changes everything? Even if we just find the right chemical conditions, it would prove that life-supporting environments are probably common in our solar system.

The 6-year journey is going to feel like forever though!',
        sample_user_id,
        seti_cat_id,
        NOW() - INTERVAL '4 hours',
        178,
        24,
        18
    ),
    (
        'The Expanse vs reality: How accurate did it get?',
        'the-expanse-vs-reality-accuracy-' || extract(epoch from now())::text,
        'Just finished my third rewatch of The Expanse and I''m amazed by how much they got right about space politics and technology. The Epstein Drive is obviously fictional, but the way they handled things like thrust gravity, orbital mechanics, and even the social implications of space colonization feels incredibly realistic.

What impressed me most:
- Ceres Station actually looking like a spinning asteroid habitat
- The Belt/Mars/Earth political tensions feeling completely plausible  
- Ships actually flipping and burning to decelerate (looking at you, other sci-fi shows)
- The realistic portrayal of what zero-g does to the human body

Obviously some liberties were taken (that torch drive efficiency is pure magic), but compared to most space shows, it felt like hard science fiction.

Anyone read the books? I''m curious how they compare. Also, what other sci-fi do you think gets space right? I''ve heard good things about For All Mankind but haven''t started it yet.',
        sample_user_id,
        scifi_cat_id,
        NOW() - INTERVAL '12 hours',
        145,
        22,
        16
    ),
    (
        'Calling all astrophotographers - gear recommendations?',
        'astrophotography-gear-recommendations-' || extract(epoch from now())::text,
        'I''ve been doing basic astrophotography with just a DSLR and tripod for about a year, but I''m ready to take the next step. Looking to get into deep space objects - nebulae, galaxies, that sort of thing.

My budget is around $2000-3000 for everything. I''ve been researching but honestly feeling a bit overwhelmed by all the options. Refractor vs reflector? Go/no-go mount vs alt-az with tracking?

Current setup:
- Canon EOS R6
- Basic tripod
- 50mm and 200mm lenses

I live in a Bortle 6 zone (suburb with decent skies), but willing to drive to darker sites for special shots.

What would you prioritize with that budget? A good tracking mount seems essential, but then I''m not sure how much to spend on the scope itself vs imaging accessories.

Also, any software recommendations for stacking and processing? I''ve been using the free stuff but wondering if it''s worth investing in PixInsight.

Thanks for any advice! This community has been awesome for learning.',
        sample_user_id,
        astronomy_cat_id,
        NOW() - INTERVAL '18 hours',
        167,
        15,
        23
    ),
    (
        'Breakthrough Listen: Are we searching in the right places?',
        'breakthrough-listen-search-strategy-' || extract(epoch from now())::text,
        'Been following the Breakthrough Listen project for a while now, and I''m curious about their search strategy. They''re focusing on the nearest million stars, but is that really the best approach?

I get the logic - closer stars are easier to detect signals from. But what if advanced civilizations have moved beyond radio communication entirely? We might be looking for the equivalent of smoke signals while they''re using quantum entanglement or something we haven''t even discovered yet.

The Wow! Signal from 1977 is still unexplained, and that was just 72 seconds. Makes you wonder what we might have missed in the decades before continuous monitoring.

Also interesting that they''re now looking at the galactic center region. Higher star density means more potential civilizations, but also way more interference and background noise.

What do you think about the Fermi Paradox in all this? Are we alone, or just looking wrong? Sometimes I wonder if we''re like ants trying to detect WiFi signals.',
        sample_user_id,
        seti_cat_id,
        NOW() - INTERVAL '3 days',
        134,
        18,
        9
    ),
    (
        'Welcome space nerds! Introduce yourself here 🚀',
        'welcome-introductions-space-nerds-' || extract(epoch from now())::text,
        'Hey everyone! Welcome to our little corner of the internet for space enthusiasts, astronomy geeks, and anyone fascinated by the cosmos.

This forum is for all of us who:
- Stay up late watching rocket launches
- Get genuinely excited about exoplanet discoveries  
- Have strong opinions about different spacecraft designs
- Dream about humanity becoming a spacefaring civilization
- Love both hard science and science fiction

A few quick guidelines:
- Be kind and respectful - we''re all here to learn
- Share your excitement and curiosity freely
- Back up claims with sources when possible
- Don''t be afraid to ask "dumb" questions - we all started somewhere

I''ll start: I''m a software engineer by day, amateur astronomer by night. Got into space stuff watching Space Shuttle launches as a kid, and recently got back into it thanks to SpaceX making launches exciting again.

What''s your space origin story? What got you interested in the cosmos?',
        sample_user_id,
        general_cat_id,
        NOW() - INTERVAL '5 days',
        312,
        45,
        28
    );

END $$;

-- Add realistic replies to the welcome post
DO $$
DECLARE
    welcome_post_id UUID;
    sample_user_id UUID;
BEGIN
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    SELECT id INTO welcome_post_id FROM posts WHERE title LIKE 'Welcome space nerds!%' LIMIT 1;
    
    INSERT INTO replies (content, author_id, post_id, created_at) VALUES
    ('Hey! Aerospace engineer here, working on satellite systems. My space obsession started with watching Apollo 11 footage as a kid - that "one small step" moment still gives me chills. Currently most excited about the upcoming lunar missions and Mars sample return!', sample_user_id, welcome_post_id, NOW() - INTERVAL '2 days'),
    ('Welcome! I''m a high school physics teacher and amateur astrophotographer. Got hooked on space after seeing Saturn through a telescope for the first time - those rings are just magical. Love sharing the wonder with my students!', sample_user_id, welcome_post_id, NOW() - INTERVAL '1 day'),
    ('Nice to meet everyone! I''m a grad student studying exoplanet atmospheres. Been fascinated by space since I was like 8 and learned that there might be billions of Earth-like planets out there. The James Webb discoveries have been absolutely incredible for my field!', sample_user_id, welcome_post_id, NOW() - INTERVAL '18 hours'),
    ('Hey all! Retired NASA contractor here - worked on Space Shuttle mission planning for 20 years. Happy to share any behind-the-scenes stories if anyone''s interested. The current commercial space boom reminds me of the excitement we had back in the shuttle days!', sample_user_id, welcome_post_id, NOW() - INTERVAL '12 hours'),
    ('What''s up space fam! I''m just a regular person who gets way too excited about rocket launches. Woke up at 3 AM to watch the Europa Clipper launch and zero regrets. This community seems awesome!', sample_user_id, welcome_post_id, NOW() - INTERVAL '6 hours');
    
END $$;

-- Update post statistics
UPDATE posts SET 
  reply_count = (
    SELECT COUNT(*) 
    FROM replies 
    WHERE replies.post_id = posts.id AND replies.is_hidden = false
  ),
  last_reply_at = (
    SELECT GREATEST(
      posts.created_at,
      COALESCE(MAX(replies.created_at), posts.created_at)
    )
    FROM replies 
    WHERE replies.post_id = posts.id
  );

-- Update category statistics  
UPDATE categories SET
  post_count = (
    SELECT COUNT(*) 
    FROM posts 
    WHERE posts.category_id = categories.id AND posts.is_hidden = false
  ),
  last_post_at = (
    SELECT MAX(created_at) 
    FROM posts 
    WHERE posts.category_id = categories.id AND posts.is_hidden = false
  ); 