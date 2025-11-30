// Types for Habit Tracker with Matrix view
export interface Habit {
  id: string;
  name: string;
  color: string;
  frequency: 'daily' | 'weekly';
  goal_per_week?: number; // Optional, mainly for weekly habits
  subHabits?: Habit[]; // Recursive structure for sub-habits
  logs?: Record<string, boolean>; // Record of completed dates: { "2024-01-15": true }
  isNegative?: boolean; // Negative habits (e.g., "getting croissants")
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date_completed: string; // ISO date string (YYYY-MM-DD)
}

// For batch operations
export interface PendingLog {
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface Page {
  id: string;
  title: string;
  headingImage?: string;
  body: string;
  images: string[];
  createdAt: Date;
  isFeatured?: boolean;
  externalUrl?: string; // Optional external link for blog posts, etc.
}
