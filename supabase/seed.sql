-- Seed 20 sample profiles for testing
-- Temporarily drops FK constraint, inserts profiles, then re-adds it

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO profiles (id, display_name, email, skin_tone, hair_style, clothing_style, height_range, weight_range, gender, age, description, interests, rating, tokens, onboarding_complete, status) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Emma Wilson', 'emma@example.com', '#FFE0BD', 'long', 'casual', '5_5-5_9', '50-60', 'female', 24, 'Love hiking and photography. Looking for genuine connections.', ARRAY['hiking', 'photography', 'coffee'], 4.8, 15, true, 'active'),
  ('a0000001-0000-0000-0000-000000000002', 'Liam Chen', 'liam@example.com', '#F1C27D', 'short', 'formal', '5_10-6_1', '70-85', 'male', 28, 'Software engineer who also rocks at cooking. Let us chat over a virtual dinner.', ARRAY['cooking', 'coding', 'travel'], 4.5, 10, true, 'active'),
  ('a0000001-0000-0000-0000-000000000003', 'Sophia Rivera', 'sophia@example.com', '#D4A574', 'curly', 'elegant', '5_0-5_4', '50-60', 'female', 22, 'Art student who loves late night talks about the universe.', ARRAY['art', 'philosophy', 'music'], 4.9, 20, true, 'active'),
  ('a0000001-0000-0000-0000-000000000004', 'Noah Patel', 'noah@example.com', '#A0724A', 'afro', 'sporty', '5_10-6_1', '70-85', 'male', 26, 'Fitness enthusiast and plant dad. Looking for someone to grow with.', ARRAY['gym', 'plants', 'yoga'], 4.3, 8, true, 'active'),
  ('a0000001-0000-0000-0000-000000000005', 'Olivia Kim', 'olivia@example.com', '#F1C27D', 'ponytail', 'sporty', '5_5-5_9', '50-60', 'female', 27, 'Marathon runner who also bakes amazing cookies. Balance is key.', ARRAY['running', 'baking', 'reading'], 4.7, 12, true, 'active'),
  ('a0000001-0000-0000-0000-000000000006', 'Ethan Brooks', 'ethan@example.com', '#FFE0BD', 'medium', 'casual', '6_2+', '70-85', 'male', 30, 'Former basketball player, current dog dad. Simple things make me happy.', ARRAY['basketball', 'dogs', 'movies'], 4.1, 5, true, 'active'),
  ('a0000001-0000-0000-0000-000000000007', 'Ava Martinez', 'ava@example.com', '#D4A574', 'bun', 'bohemian', '5_0-5_4', 'under_50', 'female', 21, 'Free spirit who lives for music festivals and sunsets.', ARRAY['festivals', 'travel', 'yoga'], 4.6, 18, true, 'active'),
  ('a0000001-0000-0000-0000-000000000008', 'Mason Johnson', 'mason@example.com', '#6B4226', 'bald', 'formal', '5_10-6_1', '85+', 'male', 35, 'Business owner who values deep conversations over small talk.', ARRAY['finance', 'wine', 'chess'], 4.4, 25, true, 'active'),
  ('a0000001-0000-0000-0000-000000000009', 'Isabella Thompson', 'isabella@example.com', '#FFE0BD', 'long', 'elegant', '5_5-5_9', '60-70', 'female', 25, 'Fashion designer who loves vintage stores and poetry.', ARRAY['fashion', 'poetry', 'thrifting'], 4.8, 14, true, 'active'),
  ('a0000001-0000-0000-0000-000000000010', 'Lucas Garcia', 'lucas@example.com', '#F1C27D', 'curly', 'casual', '5_5-5_9', '60-70', 'male', 23, 'Musician always looking for inspiration. Maybe you are my next song?', ARRAY['music', 'guitar', 'writing'], 4.2, 7, true, 'active'),
  ('a0000001-0000-0000-0000-000000000011', 'Mia Anderson', 'mia@example.com', '#A0724A', 'short', 'bohemian', '5_0-5_4', '50-60', 'female', 29, 'Yoga instructor who believes in good vibes only.', ARRAY['yoga', 'meditation', 'vegan'], 4.9, 22, true, 'active'),
  ('a0000001-0000-0000-0000-000000000012', 'James Taylor', 'james@example.com', '#D4A574', 'medium', 'sporty', '5_10-6_1', '70-85', 'male', 27, 'Surfer and graphic designer. Living the creative life.', ARRAY['surfing', 'design', 'coffee'], 4.3, 9, true, 'active'),
  ('a0000001-0000-0000-0000-000000000013', 'Charlotte Lee', 'charlotte@example.com', '#F1C27D', 'ponytail', 'casual', '5_5-5_9', '60-70', 'female', 26, 'Bookworm who also loves a good party. I contain multitudes.', ARRAY['reading', 'dancing', 'cats'], 4.6, 11, true, 'active'),
  ('a0000001-0000-0000-0000-000000000014', 'Benjamin White', 'benjamin@example.com', '#FFE0BD', 'short', 'formal', '5_10-6_1', '70-85', 'male', 31, 'Lawyer by day, standup comedian by night. Yes I am fun at parties.', ARRAY['comedy', 'cooking', 'soccer'], 4.0, 6, true, 'active'),
  ('a0000001-0000-0000-0000-000000000015', 'Amelia Harris', 'amelia@example.com', '#6B4226', 'afro', 'elegant', '5_5-5_9', '60-70', 'female', 28, 'Doctor who believes laughter is the best medicine.', ARRAY['medicine', 'travel', 'cooking'], 4.7, 16, true, 'active'),
  ('a0000001-0000-0000-0000-000000000016', 'Elijah Clark', 'elijah@example.com', '#A0724A', 'bald', 'casual', '6_2+', '85+', 'male', 33, 'Chef looking for someone to be my taste tester for life.', ARRAY['cooking', 'wine', 'travel'], 4.5, 13, true, 'active'),
  ('a0000001-0000-0000-0000-000000000017', 'Harper Lewis', 'harper@example.com', '#D4A574', 'long', 'bohemian', '5_0-5_4', 'under_50', 'female', 23, 'Photographer who sees beauty in everything. Let me capture our story.', ARRAY['photography', 'nature', 'writing'], 4.4, 8, true, 'active'),
  ('a0000001-0000-0000-0000-000000000018', 'Alexander Hall', 'alex@example.com', '#F1C27D', 'curly', 'sporty', '5_5-5_9', '60-70', 'male', 24, 'Skateboarder and film student. Life is a movie and we are the cast.', ARRAY['skateboarding', 'films', 'gaming'], 4.1, 4, true, 'active'),
  ('a0000001-0000-0000-0000-000000000019', 'Evelyn Allen', 'evelyn@example.com', '#FFE0BD', 'bun', 'elegant', '5_5-5_9', '50-60', 'female', 32, 'Architect who designs dreams. Hoping to find someone to build a future with.', ARRAY['architecture', 'art', 'wine'], 4.8, 19, true, 'active'),
  ('a0000001-0000-0000-0000-000000000020', 'Daniel Young', 'daniel@example.com', '#6B4226', 'short', 'casual', '5_10-6_1', '70-85', 'male', 29, 'Teacher who loves gaming and hiking. Work hard, play harder.', ARRAY['gaming', 'hiking', 'teaching'], 4.2, 7, true, 'active');

ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Note: These profiles don't have corresponding auth.users entries.
-- They will appear as candidates for real authenticated users.
-- To also create auth users for full login capability, use Supabase's
-- auth.admin.createUser() API or the Sign Up flow.
