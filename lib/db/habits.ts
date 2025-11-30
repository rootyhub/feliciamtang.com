import { supabase } from '../supabase';
import { Habit, HabitLog } from '../types';

// Convert DB row to Habit type
const toHabit = (row: any, subHabits?: Habit[]): Habit => ({
  id: row.id,
  name: row.name,
  color: row.color,
  frequency: row.frequency,
  goal_per_week: row.goal_per_week,
  isNegative: row.is_negative,
  subHabits: subHabits,
  logs: {},
  created_at: row.created_at,
});

export async function getHabits(): Promise<Habit[]> {
  // Get all habits
  const { data: allHabits, error } = await supabase
    .from('habits')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error || !allHabits) {
    console.error('Error fetching habits:', error);
    return [];
  }
  
  // Get all logs
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*');
  
  // Build logs map
  const logsMap: Record<string, Record<string, boolean>> = {};
  (logs || []).forEach((log: any) => {
    if (!logsMap[log.habit_id]) {
      logsMap[log.habit_id] = {};
    }
    logsMap[log.habit_id][log.date_completed] = true;
  });
  
  // Separate parent and child habits
  const parentHabits = allHabits.filter((h: any) => !h.parent_id);
  const childHabits = allHabits.filter((h: any) => h.parent_id);
  
  // Build habit tree with logs
  return parentHabits.map((parent: any) => {
    const children = childHabits
      .filter((c: any) => c.parent_id === parent.id)
      .map((c: any) => ({
        ...toHabit(c),
        logs: logsMap[c.id] || {},
      }));
    
    return {
      ...toHabit(parent, children.length > 0 ? children : undefined),
      logs: logsMap[parent.id] || {},
    };
  });
}

export async function addHabit(habit: {
  name: string;
  color?: string;
  frequency?: 'daily' | 'weekly';
  isNegative?: boolean;
  goal_per_week?: number;
  parentId?: string;
}): Promise<Habit | null> {
  // Get max order index
  const { data: maxOrder } = await supabase
    .from('habits')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single();
  
  const { data, error } = await supabase
    .from('habits')
    .insert({
      name: habit.name,
      color: habit.color || '#22c55e',
      frequency: habit.frequency || 'daily',
      is_negative: habit.isNegative || false,
      goal_per_week: habit.goal_per_week,
      parent_id: habit.parentId,
      order_index: (maxOrder?.order_index || 0) + 1,
    })
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error adding habit:', error);
    return null;
  }
  
  return toHabit(data);
}

export async function updateHabit(id: string, updates: Partial<{
  name: string;
  color: string;
  frequency: 'daily' | 'weekly';
  isNegative: boolean;
  goal_per_week: number;
}>): Promise<Habit | null> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
  if (updates.isNegative !== undefined) dbUpdates.is_negative = updates.isNegative;
  if (updates.goal_per_week !== undefined) dbUpdates.goal_per_week = updates.goal_per_week;
  
  const { data, error } = await supabase
    .from('habits')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error updating habit:', error);
    return null;
  }
  
  return toHabit(data);
}

export async function deleteHabit(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting habit:', error);
    return false;
  }
  
  return true;
}

export async function moveHabit(id: string, direction: 'up' | 'down'): Promise<void> {
  const habits = await getHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index === -1) return;
  
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= habits.length) return;
  
  // Swap order indices
  const currentHabit = habits[index];
  const swapHabit = habits[newIndex];
  
  await supabase
    .from('habits')
    .update({ order_index: newIndex })
    .eq('id', currentHabit.id);
  
  await supabase
    .from('habits')
    .update({ order_index: index })
    .eq('id', swapHabit.id);
}

export async function getHabitLogs(startDate?: Date, endDate?: Date): Promise<HabitLog[]> {
  let query = supabase.from('habit_logs').select('*');
  
  if (startDate) {
    query = query.gte('date_completed', startDate.toISOString().split('T')[0]);
  }
  if (endDate) {
    query = query.lte('date_completed', endDate.toISOString().split('T')[0]);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching habit logs:', error);
    return [];
  }
  
  return data.map((row: any) => ({
    id: row.id,
    habit_id: row.habit_id,
    date_completed: row.date_completed,
  }));
}

export async function toggleHabitLog(habitId: string, date: string, completed: boolean): Promise<boolean> {
  if (completed) {
    // Add log
    const { error } = await supabase
      .from('habit_logs')
      .upsert({
        habit_id: habitId,
        date_completed: date,
      }, {
        onConflict: 'habit_id,date_completed',
      });
    
    if (error) {
      console.error('Error adding habit log:', error);
      return false;
    }
  } else {
    // Remove log
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('date_completed', date);
    
    if (error) {
      console.error('Error removing habit log:', error);
      return false;
    }
  }
  
  return true;
}

export async function submitHabitLogs(logs: { habitId: string; date: string; completed: boolean }[]): Promise<boolean> {
  for (const log of logs) {
    const success = await toggleHabitLog(log.habitId, log.date, log.completed);
    if (!success) return false;
  }
  return true;
}

