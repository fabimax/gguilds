/**
 * Supabase client configuration for server-side usage
 * 
 * This file creates and exports two Supabase clients:
 * - supabaseAdmin: Uses the service role key for admin actions (high privilege)
 * - supabaseClient: Uses the anon key for public actions (lower privilege)
 */
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create Supabase client with anon key (public privileges)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {
  supabaseAdmin,  // Use for admin operations (BE only)
  supabaseClient  // Use for public operations
};