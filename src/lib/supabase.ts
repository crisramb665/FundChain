import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Campaign = {
  id: string;
  contract_id: string | null;
  organizer_id: string;
  title: string;
  description: string;
  goal_amount: string;
  token: 'ETH' | 'USDC';
  deadline: string;
  campaign_type: 'event' | 'preorder' | 'donation';
  image_url: string | null;
  status: 'pending' | 'active' | 'successful' | 'failed' | 'cancelled';
  total_pledged: string;
  backer_count: number;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Profile = {
  id: string;
  wallet_address: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignTier = {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  min_amount: string;
  max_backers: number | null;
  current_backers: number;
  position: number;
  created_at: string;
};

export type Pledge = {
  id: string;
  campaign_id: string;
  backer_id: string;
  amount: string;
  token: 'ETH' | 'USDC';
  tx_hash: string | null;
  tier_id: string | null;
  status: 'pending' | 'confirmed' | 'refunded' | 'withdrawn';
  created_at: string;
  profiles?: Profile;
};

export type ActivityLog = {
  id: string;
  campaign_id: string;
  user_id: string | null;
  event_type: string;
  data: Record<string, any>;
  created_at: string;
  profiles?: Profile;
};
