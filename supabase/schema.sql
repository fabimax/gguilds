-- Create schema for the GoodGuilds platform
-- This should be run in the Supabase SQL Editor

-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============== SCHEMA ===============

-- PROFILES
-- Stores user profile information (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GUILDS
-- Stores information about guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GUILD_MEMBERS
-- Tracks membership of users in guilds with roles
CREATE TABLE IF NOT EXISTS guild_members (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',  -- 'admin' or 'member'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, guild_id)
);

-- GUILD_INVITATIONS
-- Stores invitations to join guilds
CREATE TABLE IF NOT EXISTS guild_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  email TEXT, -- can be null if using a token-based invite
  social_provider TEXT, -- e.g., 'twitter', 'google', etc.
  social_handle TEXT, -- e.g., '@username'
  invitation_token TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- BADGES
-- Stores information about badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_BADGES
-- Tracks which users have which badges
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, badge_id)
);

-- GUILD_BADGES
-- Tracks which guilds have which badges
CREATE TABLE IF NOT EXISTS guild_badges (
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (guild_id, badge_id)
);

-- =============== FUNCTIONS ===============

-- Function to update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============== TRIGGERS ===============

-- Create triggers to automatically update updated_at columns

-- Profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Guilds
CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON guilds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Guild Members
CREATE TRIGGER update_guild_members_updated_at
BEFORE UPDATE ON guild_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Badges
CREATE TRIGGER update_badges_updated_at
BEFORE UPDATE ON badges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============== ROW LEVEL SECURITY ===============

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_badges ENABLE ROW LEVEL SECURITY;

-- Profiles - Basic policy
-- Users can read any profile
-- Users can only update their own profile
CREATE POLICY profiles_read_policy ON profiles
  FOR SELECT USING (true);
  
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Guilds - Basic policy
-- Anyone can read guild information
-- Only admins can update
CREATE POLICY guilds_read_policy ON guilds
  FOR SELECT USING (true);
  
CREATE POLICY guilds_insert_policy ON guilds
  FOR INSERT WITH CHECK (auth.uid() = created_by);
  
CREATE POLICY guilds_update_policy ON guilds
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM guild_members
      WHERE guild_id = guilds.id AND role = 'admin'
    )
  );

-- Guild Members - Basic policy
-- Anyone can read membership information
-- Only admins can modify membership (handled by Express API)
CREATE POLICY guild_members_read_policy ON guild_members
  FOR SELECT USING (true);

-- Guild Invitations - Basic policy
-- Only guild admins and the invited user can see invites
CREATE POLICY guild_invitations_read_policy ON guild_invitations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM guild_members
      WHERE guild_id = guild_invitations.guild_id AND role = 'admin'
    ) OR
    auth.email() = email
  );
  
CREATE POLICY guild_invitations_insert_policy ON guild_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM guild_members
      WHERE guild_id = guild_invitations.guild_id AND role = 'admin'
    )
  );

-- Badges - Basic policy
-- Anyone can read badge information
-- Only the creator can update
CREATE POLICY badges_read_policy ON badges
  FOR SELECT USING (true);
  
CREATE POLICY badges_insert_policy ON badges
  FOR INSERT WITH CHECK (auth.uid() = created_by);
  
CREATE POLICY badges_update_policy ON badges
  FOR UPDATE USING (auth.uid() = created_by);

-- User Badges - Basic policy
-- Anyone can read user badge information
-- Assignment handled by Express API
CREATE POLICY user_badges_read_policy ON user_badges
  FOR SELECT USING (true);

-- Guild Badges - Basic policy
-- Anyone can read guild badge information
-- Assignment handled by Express API
CREATE POLICY guild_badges_read_policy ON guild_badges
  FOR SELECT USING (true);