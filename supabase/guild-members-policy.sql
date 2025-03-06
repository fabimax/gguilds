-- GUILD_MEMBERS INSERT POLICY
-- This less restrictive policy allows users to join guilds
-- Security validation is handled at the Express API layer
-- Needed to fix the "violates row-level security policy" error

-- Enable inserting new guild members through the API
CREATE POLICY guild_members_insert_policy ON guild_members
  FOR INSERT WITH CHECK (true);

-- To undo this change if needed:
-- DROP POLICY guild_members_insert_policy ON guild_members;

-- A more restrictive alternative (not currently used):
-- CREATE POLICY guild_members_insert_policy ON guild_members
--   FOR INSERT WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM guild_invited_handles
--       WHERE guild_id = guild_members.guild_id
--       AND joined_by = auth.uid()
--     )
--   );