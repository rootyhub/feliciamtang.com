import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Only create the real client if configured
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as unknown as SupabaseClient); // Type assertion - we check isSupabaseConfigured before using

// Database types
export interface DbPage {
  id: string;
  title: string;
  slug: string | null;
  heading_image: string | null;
  body: string;
  excerpt: string | null;
  images: string[];
  is_featured: boolean;
  external_url: string | null;
  layout: 'default' | 'gallery' | 'photo-journal';
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbHabit {
  id: string;
  name: string;
  color: string;
  frequency: 'daily' | 'weekly';
  goal_per_week: number | null;
  is_negative: boolean;
  parent_id: string | null;
  order_index: number;
  created_at: string;
}

export interface DbHabitLog {
  id: string;
  habit_id: string;
  date_completed: string;
  created_at: string;
}

export interface DbSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

