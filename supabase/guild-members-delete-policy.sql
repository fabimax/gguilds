-- GUILD_MEMBERS DELETE POLICY
-- Allow users to delete only their own membership
CREATE POLICY guild_members_delete_policy ON guild_members
  FOR DELETE USING (auth.uid() = user_id);