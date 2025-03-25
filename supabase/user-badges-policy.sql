-- USER_BADGES INSERT POLICY
-- This less restrictive policy allows badge assignment through the API
-- Security validation is handled at the Express API layer

-- Enable inserting new badge assignments through the API
CREATE POLICY user_badges_insert_policy ON user_badges
  FOR INSERT WITH CHECK (true);

-- Enable the same for guild badges
CREATE POLICY guild_badges_insert_policy ON guild_badges
  FOR INSERT WITH CHECK (true);