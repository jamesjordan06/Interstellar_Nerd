-- Create space_facts table
CREATE TABLE IF NOT EXISTS space_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact TEXT NOT NULL,
  source TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_space_facts_updated_at 
  BEFORE UPDATE ON space_facts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial space facts
INSERT INTO space_facts (fact, category, source) VALUES
('🌌 The observable universe contains over 2 trillion galaxies', 'cosmology', 'Hubble Space Telescope observations'),
('🚀 It would take 9 years to walk to the Moon at average walking speed', 'moon', 'NASA calculations'),
('⭐ Neutron stars can spin 600 times per second', 'stars', 'Pulsar observations'),
('🪐 Saturn''s moon Titan has lakes and rivers made of liquid methane', 'moons', 'Cassini-Huygens mission'),
('🌟 The Sun converts 4 million tons of matter into energy every second', 'sun', 'Nuclear fusion calculations'),
('🌍 Earth travels through space at 67,000 mph around the Sun', 'earth', 'Orbital mechanics'),
('🔥 Venus is hotter than Mercury despite being farther from the Sun', 'planets', 'Planetary science'),
('🌙 The Moon is gradually moving away from Earth at 3.8cm per year', 'moon', 'Lunar laser ranging'),
('💫 A day on Venus is longer than its year', 'planets', 'Planetary rotation studies'),
('🌠 Most meteors burn up at 50-75 miles above Earth''s surface', 'meteors', 'Atmospheric physics'),
('🌌 One teaspoon of neutron star material would weigh 6 billion tons on Earth', 'stars', 'Neutron star physics'),
('🚀 The International Space Station travels at 17,500 mph', 'space-station', 'NASA ISS data'),
('⭐ Our galaxy, the Milky Way, contains 100-400 billion stars', 'galaxy', 'Astronomical surveys'),
('🪐 Jupiter has at least 95 known moons', 'planets', 'Planetary observations'),
('🌟 Light from the Sun takes 8 minutes and 20 seconds to reach Earth', 'sun', 'Speed of light calculations'),
('🌍 Earth is the only known planet with plate tectonics', 'earth', 'Geological studies'),
('🔴 Mars has the largest volcano in the solar system - Olympus Mons', 'planets', 'Mars exploration'),
('🌙 The Moon was likely formed from debris after a Mars-sized object hit Earth', 'moon', 'Giant impact hypothesis'),
('💫 Black holes can have temperatures near absolute zero', 'black-holes', 'Hawking radiation theory'),
('🌠 About 100 tons of space dust and particles enter Earth''s atmosphere daily', 'meteors', 'Atmospheric studies');

-- Enable Row Level Security (optional)
-- ALTER TABLE space_facts ENABLE ROW LEVEL SECURITY;

-- Create policy for reading facts (everyone can read)
-- CREATE POLICY "Anyone can read space facts" ON space_facts
--   FOR SELECT USING (is_active = true);

-- Create policy for admin updates (you can customize this)
-- CREATE POLICY "Authenticated users can manage facts" ON space_facts
--   FOR ALL USING (auth.role() = 'authenticated'); 