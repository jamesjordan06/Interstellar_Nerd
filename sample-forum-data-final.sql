-- Sample forum data to populate the forum
-- Final version with unique slugs and conflict handling

-- Insert sample categories (with slug for uniqueness)
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('Space & Astronomy', 'space-astronomy', 'Discuss the cosmos, space exploration, and astronomical discoveries', '#3B82F6', '🚀', 1),
('Technology', 'technology', 'Latest tech news, gadgets, and programming discussions', '#10B981', '💻', 2),
('Gaming', 'gaming', 'Video games, reviews, and gaming culture', '#8B5CF6', '🎮', 3),
('Science Fiction', 'science-fiction', 'Books, movies, TV shows, and sci-fi discussions', '#F59E0B', '👽', 4),
('General Discussion', 'general-discussion', 'Everything else that doesn''t fit in other categories', '#6B7280', '💬', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample posts with unique slugs
DO $$
DECLARE
    space_cat_id UUID;
    tech_cat_id UUID;
    gaming_cat_id UUID;
    scifi_cat_id UUID;
    general_cat_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO space_cat_id FROM categories WHERE slug = 'space-astronomy';
    SELECT id INTO tech_cat_id FROM categories WHERE slug = 'technology';
    SELECT id INTO gaming_cat_id FROM categories WHERE slug = 'gaming';
    SELECT id INTO scifi_cat_id FROM categories WHERE slug = 'science-fiction';
    SELECT id INTO general_cat_id FROM categories WHERE slug = 'general-discussion';
    
    -- Get a sample user
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Insert main posts
    INSERT INTO posts (title, slug, content, author_id, category_id, created_at, view_count, like_count, reply_count) VALUES
    (
        'James Webb Space Telescope Latest Discoveries',
        'james-webb-space-telescope-latest-discoveries-' || extract(epoch from now())::text,
        'The James Webb Space Telescope has been delivering incredible images and data about our universe. What discoveries have blown your mind the most? I''m particularly fascinated by the deep field images showing galaxies from when the universe was just a few hundred million years old.

**Recent highlights:**
- Atmospheric analysis of exoplanets
- Star formation in distant galaxies  
- The most detailed images of nebulae ever captured

What do you think will be the next major breakthrough from JWST?',
        sample_user_id,
        space_cat_id,
        NOW() - INTERVAL '4 days',
        127,
        18,
        7
    ),
    (
        'The Future of Mars Colonization',
        'the-future-of-mars-colonization-' || extract(epoch from now())::text,
        'With SpaceX''s recent advances and NASA''s Artemis program, Mars colonization feels closer than ever. But what are the biggest challenges we still need to solve?

**Key challenges:**
- Radiation protection during the journey
- Sustainable life support systems
- Psychological effects of isolation
- Creating a self-sufficient colony

Do you think we''ll see humans on Mars within the next 20 years? What technologies are you most excited about?',
        sample_user_id,
        space_cat_id,
        NOW() - INTERVAL '3 days',
        98,
        12,
        5
    ),
    (
        'AI and Machine Learning in 2024',
        'ai-and-machine-learning-in-2024-' || extract(epoch from now())::text,
        'The pace of AI development in 2024 has been absolutely incredible. From GPT models to image generation to code assistance, AI is transforming every industry.

**What I''m tracking:**
- Large Language Models getting smaller and more efficient
- AI integration in everyday software
- Ethical considerations and regulation
- Open source vs proprietary models

What AI tools have changed your workflow the most? Are you optimistic or concerned about the rapid pace of development?',
        sample_user_id,
        tech_cat_id,
        NOW() - INTERVAL '2 days',
        156,
        23,
        12
    ),
    (
        'Best Indie Games You Haven''t Played Yet',
        'best-indie-games-you-havent-played-yet-' || extract(epoch from now())::text,
        'There have been some absolutely fantastic indie games released this year that deserve more attention. Here are my top picks:

**Hidden Gems:**
- **Cosmic Horror Puzzle Game** - Mind-bending mechanics with a Lovecraftian atmosphere
- **Pixel Art Metroidvania** - Stunning visuals and tight controls
- **Narrative Adventure** - Emotional storytelling that rivals AAA games
- **Roguelike Deckbuilder** - Addictive card-based progression

What indie games have you been playing lately? Any recommendations for games that flew under the radar?',
        sample_user_id,
        gaming_cat_id,
        NOW() - INTERVAL '1 day',
        89,
        15,
        8
    ),
    (
        'Dune: Part Two Discussion Thread',
        'dune-part-two-discussion-thread-' || extract(epoch from now())::text,
        'Just saw Dune: Part Two and my mind is completely blown! Denis Villeneuve has created something truly special. The visuals, the sound design, the performances - everything was phenomenal.

**What I loved:**
- The desert planet Arrakis feels completely real
- Hans Zimmer''s soundtrack is otherworldly
- The political intrigue and world-building
- Staying faithful to Herbert''s vision

Without spoilers, what were your favorite moments? How do you think it compares to Lynch''s 1984 version? And more importantly - are you excited for Dune: Messiah?',
        sample_user_id,
        scifi_cat_id,
        NOW() - INTERVAL '6 hours',
        143,
        28,
        15
    ),
    (
        'Welcome to Interstellar Nerd Forum!',
        'welcome-to-interstellar-nerd-forum-' || extract(epoch from now())::text,
        'Welcome to our community of science fiction enthusiasts, space nerds, tech geeks, and curious minds! 

This forum is a place to discuss everything from the latest space missions to cutting-edge technology, from classic sci-fi novels to modern blockbusters, and everything in between.

**Forum Guidelines:**
- Be respectful and constructive in discussions
- Share interesting articles, news, and discoveries
- Ask questions - no question is too basic!
- Help fellow members learn and explore new topics

What brings you to our corner of the internet? Introduce yourself and let us know what you''re passionate about!',
        sample_user_id,
        general_cat_id,
        NOW() - INTERVAL '5 days',
        234,
        31,
        18
    );
    
    -- Insert additional space posts with unique slugs
    INSERT INTO posts (title, slug, content, author_id, category_id, created_at, view_count, like_count, reply_count) VALUES
    (
        'SpaceX Starship Latest Test Flight',
        'spacex-starship-latest-test-flight-' || extract(epoch from now())::text,
        'Did anyone else watch the latest Starship test? The progress they''re making is incredible. The landing attempt was so close! What do you think about their rapid iteration approach vs traditional aerospace development?',
        sample_user_id,
        space_cat_id,
        NOW() - INTERVAL '3 hours',
        67,
        9,
        4
    ),
    (
        'Exoplanet Discovery: Earth-like Planet Found',
        'exoplanet-discovery-earth-like-planet-found-' || extract(epoch from now())::text,
        'Astronomers just discovered an Earth-like planet in the habitable zone of a nearby star system. The planet appears to have an atmosphere and possibly liquid water. This could be one of the most promising candidates for potential life outside our solar system.',
        sample_user_id,
        space_cat_id,
        NOW() - INTERVAL '2 hours',
        45,
        6,
        2
    ),
    (
        'Black Hole Photography Breakthrough',
        'black-hole-photography-breakthrough-' || extract(epoch from now())::text,
        'The Event Horizon Telescope team has released new images of black holes with unprecedented detail. The ring of light around the event horizon is absolutely mesmerizing. How do they even capture images of something that doesn''t emit light?',
        sample_user_id,
        space_cat_id,
        NOW() - INTERVAL '1 hour',
        38,
        5,
        1
    );

END $$;

-- Add some sample replies to the welcome post
DO $$
DECLARE
    welcome_post_id UUID;
    sample_user_id UUID;
BEGIN
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    SELECT id INTO welcome_post_id FROM posts WHERE title = 'Welcome to Interstellar Nerd Forum!' LIMIT 1;
    
    INSERT INTO replies (content, author_id, post_id, created_at) VALUES
    ('Thanks for the warm welcome! I''m a software developer with a passion for space exploration. Looking forward to learning from everyone here.', sample_user_id, welcome_post_id, NOW() - INTERVAL '3 hours'),
    ('Great to find a community of fellow science enthusiasts! I''m particularly interested in the intersection of AI and space technology.', sample_user_id, welcome_post_id, NOW() - INTERVAL '2 hours'),
    ('Love the forum setup! As an amateur astronomer, I''m excited to share observations and learn about new discoveries.', sample_user_id, welcome_post_id, NOW() - INTERVAL '1 hour');
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