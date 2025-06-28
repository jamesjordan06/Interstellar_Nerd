-- Sample forum data to populate the forum
-- Run this in your Supabase SQL Editor after setting up your main schema

-- Insert sample categories (if not already present)
INSERT INTO categories (name, description, color, icon, sort_order) VALUES
('Space & Astronomy', 'Discuss the cosmos, space exploration, and astronomical discoveries', '#3B82F6', '🚀', 1),
('Technology', 'Latest tech news, gadgets, and programming discussions', '#10B981', '💻', 2),
('Gaming', 'Video games, reviews, and gaming culture', '#8B5CF6', '🎮', 3),
('Science Fiction', 'Books, movies, TV shows, and sci-fi discussions', '#F59E0B', '👽', 4),
('General Discussion', 'Everything else that doesn''t fit in other categories', '#6B7280', '💬', 5)
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for sample posts
WITH category_ids AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY sort_order) as rn
  FROM categories
  ORDER BY sort_order
  LIMIT 5
),
sample_user AS (
  SELECT id as user_id FROM users LIMIT 1
)
-- Insert sample posts
INSERT INTO posts (title, content, author_id, category_id, created_at, view_count, like_count, reply_count)
SELECT 
  CASE 
    WHEN c.name = 'Space & Astronomy' THEN 
      CASE 
        WHEN c.rn = 1 THEN 'James Webb Space Telescope Latest Discoveries'
        ELSE 'The Future of Mars Colonization'
      END
    WHEN c.name = 'Technology' THEN 'AI and Machine Learning in 2024'
    WHEN c.name = 'Gaming' THEN 'Best Indie Games You Haven''t Played Yet'
    WHEN c.name = 'Science Fiction' THEN 'Dune: Part Two Discussion Thread'
    ELSE 'Welcome to Interstellar Nerd Forum!'
  END as title,
  CASE 
    WHEN c.name = 'Space & Astronomy' THEN 
      CASE 
        WHEN c.rn = 1 THEN 'The James Webb Space Telescope has been delivering incredible images and data about our universe. What discoveries have blown your mind the most? I''m particularly fascinated by the deep field images showing galaxies from when the universe was just a few hundred million years old.

**Recent highlights:**
- Atmospheric analysis of exoplanets
- Star formation in distant galaxies  
- The most detailed images of nebulae ever captured

What do you think will be the next major breakthrough from JWST?'
        ELSE 'With SpaceX''s recent advances and NASA''s Artemis program, Mars colonization feels closer than ever. But what are the biggest challenges we still need to solve?

**Key challenges:**
- Radiation protection during the journey
- Sustainable life support systems
- Psychological effects of isolation
- Creating a self-sufficient colony

Do you think we''ll see humans on Mars within the next 20 years? What technologies are you most excited about?'
      END
    WHEN c.name = 'Technology' THEN 'The pace of AI development in 2024 has been absolutely incredible. From GPT models to image generation to code assistance, AI is transforming every industry.

**What I''m tracking:**
- Large Language Models getting smaller and more efficient
- AI integration in everyday software
- Ethical considerations and regulation
- Open source vs proprietary models

What AI tools have changed your workflow the most? Are you optimistic or concerned about the rapid pace of development?'
    WHEN c.name = 'Gaming' THEN 'There have been some absolutely fantastic indie games released this year that deserve more attention. Here are my top picks:

**Hidden Gems:**
- **Cosmic Horror Puzzle Game** - Mind-bending mechanics with a Lovecraftian atmosphere
- **Pixel Art Metroidvania** - Stunning visuals and tight controls
- **Narrative Adventure** - Emotional storytelling that rivals AAA games
- **Roguelike Deckbuilder** - Addictive card-based progression

What indie games have you been playing lately? Any recommendations for games that flew under the radar?'
    WHEN c.name = 'Science Fiction' THEN 'Just saw Dune: Part Two and my mind is completely blown! Denis Villeneuve has created something truly special. The visuals, the sound design, the performances - everything was phenomenal.

**What I loved:**
- The desert planet Arrakis feels completely real
- Hans Zimmer''s soundtrack is otherworldly
- The political intrigue and world-building
- Staying faithful to Herbert''s vision

Without spoilers, what were your favorite moments? How do you think it compares to Lynch''s 1984 version? And more importantly - are you excited for Dune: Messiah?'
    ELSE 'Welcome to our community of science fiction enthusiasts, space nerds, tech geeks, and curious minds! 

This forum is a place to discuss everything from the latest space missions to cutting-edge technology, from classic sci-fi novels to modern blockbusters, and everything in between.

**Forum Guidelines:**
- Be respectful and constructive in discussions
- Share interesting articles, news, and discoveries
- Ask questions - no question is too basic!
- Help fellow members learn and explore new topics

What brings you to our corner of the internet? Introduce yourself and let us know what you''re passionate about!'
  END as content,
  u.user_id,
  c.id as category_id,
  NOW() - INTERVAL '1 day' * (c.rn - 1) as created_at,
  FLOOR(RANDOM() * 150 + 50) as view_count,
  FLOOR(RANDOM() * 25 + 5) as like_count,
  FLOOR(RANDOM() * 10 + 2) as reply_count
FROM category_ids c
CROSS JOIN sample_user u
WHERE c.rn <= 5;

-- Insert additional space/astronomy posts for more content
INSERT INTO posts (title, content, author_id, category_id, created_at, view_count, like_count, reply_count)
SELECT 
  title,
  content,
  u.user_id,
  (SELECT id FROM categories WHERE name = 'Space & Astronomy'),
  NOW() - INTERVAL '1 hour' * generate_series(1, 3),
  FLOOR(RANDOM() * 100 + 20),
  FLOOR(RANDOM() * 15 + 3),
  FLOOR(RANDOM() * 8 + 1)
FROM (VALUES 
  ('SpaceX Starship Latest Test Flight', 'Did anyone else watch the latest Starship test? The progress they''re making is incredible. The landing attempt was so close! What do you think about their rapid iteration approach vs traditional aerospace development?'),
  ('Exoplanet Discovery: Earth-like Planet Found', 'Astronomers just discovered an Earth-like planet in the habitable zone of a nearby star system. The planet appears to have an atmosphere and possibly liquid water. This could be one of the most promising candidates for potential life outside our solar system.'),
  ('Black Hole Photography Breakthrough', 'The Event Horizon Telescope team has released new images of black holes with unprecedented detail. The ring of light around the event horizon is absolutely mesmerizing. How do they even capture images of something that doesn''t emit light?')
) AS sample_posts(title, content)
CROSS JOIN (SELECT id as user_id FROM users LIMIT 1) u;

-- Add some sample replies to the main posts
WITH sample_posts AS (
  SELECT p.id as post_id, p.title, u.id as user_id
  FROM posts p
  CROSS JOIN (SELECT id FROM users LIMIT 1) u
  WHERE p.title = 'Welcome to Interstellar Nerd Forum!'
)
INSERT INTO replies (content, author_id, post_id, created_at)
SELECT 
  content,
  user_id,
  post_id,
  NOW() - INTERVAL '1 hour' * generate_series(1, 3)
FROM sample_posts
CROSS JOIN (VALUES 
  ('Thanks for the warm welcome! I''m a software developer with a passion for space exploration. Looking forward to learning from everyone here.'),
  ('Great to find a community of fellow science enthusiasts! I''m particularly interested in the intersection of AI and space technology.'),
  ('Love the forum setup! As an amateur astronomer, I''m excited to share observations and learn about new discoveries.')
) AS sample_replies(content);

-- Update post statistics
UPDATE posts SET 
  reply_count = (
    SELECT COUNT(*) 
    FROM replies 
    WHERE replies.post_id = posts.id AND replies.is_hidden = false
  ),
  last_activity_at = (
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