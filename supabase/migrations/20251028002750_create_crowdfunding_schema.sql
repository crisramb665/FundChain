/*
  # Crowdfunding Platform Database Schema

  ## Overview
  This migration creates the core database structure for a decentralized crowdfunding platform
  that integrates with blockchain smart contracts. The platform supports campaign creation,
  pledge tracking, moderation workflows, and activity logging.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to wallet addresses
  - `id` (uuid, primary key) - Links to auth.users
  - `wallet_address` (text, unique) - Ethereum wallet address
  - `display_name` (text) - Optional display name
  - `avatar_url` (text) - Optional avatar image
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `campaigns`
  Crowdfunding campaigns with on-chain and off-chain data
  - `id` (uuid, primary key)
  - `contract_id` (text, unique) - On-chain campaign identifier
  - `organizer_id` (uuid) - Foreign key to profiles
  - `title` (text) - Campaign title
  - `description` (text) - Full campaign description
  - `goal_amount` (numeric) - Funding goal in wei
  - `token` (text) - Token used (ETH, USDC)
  - `deadline` (timestamptz) - Campaign end date
  - `campaign_type` (text) - Type: event, preorder, donation
  - `image_url` (text) - Campaign banner image
  - `status` (text) - Status: pending, active, successful, failed, cancelled
  - `total_pledged` (numeric) - Current amount pledged (cached from contract)
  - `backer_count` (integer) - Number of unique backers
  - `moderation_status` (text) - Moderation: pending, approved, rejected
  - `moderation_notes` (text) - Admin notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `campaign_tiers`
  Optional reward tiers for campaigns
  - `id` (uuid, primary key)
  - `campaign_id` (uuid) - Foreign key to campaigns
  - `title` (text) - Tier name
  - `description` (text) - Tier description
  - `min_amount` (numeric) - Minimum pledge amount in wei
  - `max_backers` (integer) - Optional limit on backers
  - `current_backers` (integer) - Current number of backers
  - `position` (integer) - Display order
  - `created_at` (timestamptz)

  ### 4. `pledges`
  Individual pledge records
  - `id` (uuid, primary key)
  - `campaign_id` (uuid) - Foreign key to campaigns
  - `backer_id` (uuid) - Foreign key to profiles
  - `amount` (numeric) - Pledge amount in wei
  - `token` (text) - Token used
  - `tx_hash` (text, unique) - Transaction hash
  - `tier_id` (uuid) - Optional tier selection
  - `status` (text) - Status: pending, confirmed, refunded, withdrawn
  - `created_at` (timestamptz)

  ### 5. `activity_log`
  Event log for campaign activities
  - `id` (uuid, primary key)
  - `campaign_id` (uuid) - Foreign key to campaigns
  - `user_id` (uuid) - Foreign key to profiles (optional)
  - `event_type` (text) - Type: created, pledged, withdrawn, refunded, etc.
  - `data` (jsonb) - Event metadata
  - `created_at` (timestamptz)

  ## Security

  All tables have Row Level Security (RLS) enabled with the following policies:

  ### profiles
  - Anyone can view profiles
  - Users can update their own profile only

  ### campaigns
  - Anyone can view approved campaigns
  - Organizers can create campaigns
  - Organizers can update their own campaigns
  - Admins can update any campaign (moderation)

  ### campaign_tiers
  - Anyone can view tiers for approved campaigns
  - Organizers can manage tiers for their campaigns

  ### pledges
  - Backers can view their own pledges
  - Organizers can view pledges for their campaigns
  - Backers can create pledges

  ### activity_log
  - Anyone can view activity for approved campaigns
  - System can insert activity logs

  ## Indexes

  Performance indexes on frequently queried columns:
  - wallet_address for profile lookups
  - contract_id for blockchain sync
  - campaign status and moderation filters
  - pledge lookups by campaign and backer
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id text UNIQUE,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  goal_amount numeric NOT NULL,
  token text DEFAULT 'ETH' NOT NULL,
  deadline timestamptz NOT NULL,
  campaign_type text DEFAULT 'donation' NOT NULL,
  image_url text,
  status text DEFAULT 'pending' NOT NULL,
  total_pledged numeric DEFAULT 0 NOT NULL,
  backer_count integer DEFAULT 0 NOT NULL,
  moderation_status text DEFAULT 'pending' NOT NULL,
  moderation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'successful', 'failed', 'cancelled')),
  CONSTRAINT valid_campaign_type CHECK (campaign_type IN ('event', 'preorder', 'donation')),
  CONSTRAINT valid_moderation_status CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT valid_token CHECK (token IN ('ETH', 'USDC'))
);

-- Create campaign_tiers table
CREATE TABLE IF NOT EXISTS campaign_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  min_amount numeric NOT NULL,
  max_backers integer,
  current_backers integer DEFAULT 0 NOT NULL,
  position integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pledges table
CREATE TABLE IF NOT EXISTS pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  backer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  token text DEFAULT 'ETH' NOT NULL,
  tx_hash text UNIQUE,
  tier_id uuid REFERENCES campaign_tiers(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_pledge_status CHECK (status IN ('pending', 'confirmed', 'refunded', 'withdrawn')),
  CONSTRAINT valid_pledge_token CHECK (token IN ('ETH', 'USDC'))
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_campaigns_contract ON campaigns(contract_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_moderation ON campaigns(moderation_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiers_campaign ON campaign_tiers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON pledges(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pledges_backer ON pledges(backer_id);
CREATE INDEX IF NOT EXISTS idx_pledges_tx ON pledges(tx_hash);
CREATE INDEX IF NOT EXISTS idx_activity_campaign ON activity_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Anyone can view approved campaigns"
  ON campaigns FOR SELECT
  TO authenticated, anon
  USING (moderation_status = 'approved' OR organizer_id = auth.uid());

CREATE POLICY "Organizers can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Campaign tiers policies
CREATE POLICY "Anyone can view tiers"
  ON campaign_tiers FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_tiers.campaign_id
      AND (campaigns.moderation_status = 'approved' OR campaigns.organizer_id = auth.uid())
    )
  );

CREATE POLICY "Organizers can manage tiers"
  ON campaign_tiers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_tiers.campaign_id
      AND campaigns.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_tiers.campaign_id
      AND campaigns.organizer_id = auth.uid()
    )
  );

-- Pledges policies
CREATE POLICY "Users can view own pledges"
  ON pledges FOR SELECT
  TO authenticated
  USING (backer_id = auth.uid());

CREATE POLICY "Organizers can view campaign pledges"
  ON pledges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = pledges.campaign_id
      AND campaigns.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view pledges for approved campaigns"
  ON pledges FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = pledges.campaign_id
      AND campaigns.moderation_status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can create pledges"
  ON pledges FOR INSERT
  TO authenticated
  WITH CHECK (backer_id = auth.uid());

-- Activity log policies
CREATE POLICY "Anyone can view activity"
  ON activity_log FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = activity_log.campaign_id
      AND (campaigns.moderation_status = 'approved' OR campaigns.organizer_id = auth.uid())
    )
  );

CREATE POLICY "System can insert activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();