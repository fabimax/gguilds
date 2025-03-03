-- GUILD_INVITED_HANDLES
-- Stores social media handles that are pre-approved to join a guild
CREATE TABLE IF NOT EXISTS guild_invited_handles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  social_provider TEXT NOT NULL, -- e.g., 'twitter', 'google', etc.
  social_handle TEXT NOT NULL, -- e.g., 'eigenrobot' (without @)
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE, -- Will be NULL until they join
  joined_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- User ID who joined using this invite
  UNIQUE (guild_id, social_provider, social_handle)
);

-- Add RLS policies
ALTER TABLE guild_invited_handles ENABLE ROW LEVEL SECURITY;

-- Anyone can read invited handles for a guild
CREATE POLICY guild_invited_handles_read_policy ON guild_invited_handles
  FOR SELECT USING (true);

-- Only guild admins can add invited handles
CREATE POLICY guild_invited_handles_insert_policy ON guild_invited_handles
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM guild_members
      WHERE guild_id = guild_invited_handles.guild_id AND role = 'admin'
    )
  );

-- Only guild admins can update invited handles
CREATE POLICY guild_invited_handles_update_policy ON guild_invited_handles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM guild_members
      WHERE guild_id = guild_invited_handles.guild_id AND role = 'admin'
    )
  );

-- Only guild admins can delete invited handles
CREATE POLICY guild_invited_handles_delete_policy ON guild_invited_handles
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM guild_members
      WHERE guild_id = guild_invited_handles.guild_id AND role = 'admin'
    )
  );