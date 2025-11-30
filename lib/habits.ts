// Mock data store - replace with Supabase later
import { Habit, HabitLog, PendingLog } from "./types";
import { format, subDays } from "date-fns";

// Check if we're in browser
const isBrowser = typeof window !== "undefined";

// Initial habits data
const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Read 30 mins",
    color: "#22c55e",
    frequency: "daily",
    isNegative: false,
    logs: {},
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Workout",
    color: "#3b82f6",
    frequency: "daily",
    isNegative: false,
    subHabits: [
      {
        id: "2-1",
        name: "Warmup",
        color: "#3b82f6",
        frequency: "daily",
        isNegative: false,
        logs: {},
        created_at: new Date().toISOString(),
      },
      {
        id: "2-2",
        name: "Cardio",
        color: "#3b82f6",
        frequency: "daily",
        isNegative: false,
        logs: {},
        created_at: new Date().toISOString(),
      },
      {
        id: "2-3",
        name: "Weights",
        color: "#3b82f6",
        frequency: "daily",
        isNegative: false,
        logs: {},
        created_at: new Date().toISOString(),
      },
    ],
    logs: {},
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Meditate",
    color: "#a855f7",
    frequency: "daily",
    isNegative: false,
    logs: {},
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Eat Croissant",
    color: "#ef4444",
    frequency: "daily",
    isNegative: true,
    logs: {},
    created_at: new Date().toISOString(),
  },
];

// Load habits from localStorage or use initial data
const loadHabitsFromStorage = (): Habit[] => {
  if (isBrowser) {
    const stored = localStorage.getItem("habits");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse habits from localStorage", e);
      }
    }
  }
  return [...initialHabits];
};

// Save habits to localStorage
const saveHabitsToStorage = (habitsToSave: Habit[]) => {
  if (isBrowser) {
    localStorage.setItem("habits", JSON.stringify(habitsToSave));
  }
};

let habits: Habit[] = loadHabitsFromStorage();

// Load habit logs from localStorage or generate
const loadHabitLogsFromStorage = (): HabitLog[] => {
  if (isBrowser) {
    const stored = localStorage.getItem("habitLogs");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse habitLogs from localStorage", e);
      }
    }
  }
  return [];
};

// Save habit logs to localStorage
const saveHabitLogsToStorage = (logsToSave: HabitLog[]) => {
  if (isBrowser) {
    localStorage.setItem("habitLogs", JSON.stringify(logsToSave));
  }
};

// Pre-populate past year of habit data
let habitLogs: HabitLog[] = loadHabitLogsFromStorage();

const generatePastYearData = () => {
  const today = new Date();
  const oneYearAgo = subDays(today, 365);
  const logs: HabitLog[] = [];

  // Generate logs for positive habits (70-90% completion rate)
  const positiveHabits = habits.filter((h) => !h.isNegative);
  positiveHabits.forEach((habit) => {
    for (let i = 0; i < 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      // 70-90% completion rate for positive habits
      const completionRate = 0.7 + Math.random() * 0.2;
      if (Math.random() < completionRate) {
        logs.push({
          id: `${habit.id}-${dateStr}`,
          habit_id: habit.id,
          date_completed: dateStr,
        });
      }

      // Also log sub-habits
      if (habit.subHabits) {
        habit.subHabits.forEach((subHabit) => {
          if (Math.random() < completionRate * 0.8) {
            logs.push({
              id: `${subHabit.id}-${dateStr}`,
              habit_id: subHabit.id,
              date_completed: dateStr,
            });
          }
        });
      }
    }
  });

  // Generate logs for negative habits (20-40% completion rate - lower is better)
  const negativeHabits = habits.filter((h) => h.isNegative);
  negativeHabits.forEach((habit) => {
    for (let i = 0; i < 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      // 20-40% completion rate for negative habits (we want to avoid these)
      const completionRate = 0.2 + Math.random() * 0.2;
      if (Math.random() < completionRate) {
        logs.push({
          id: `${habit.id}-${dateStr}`,
          habit_id: habit.id,
          date_completed: dateStr,
        });
      }
    }
  });

  return logs;
};

// Generate mock data for habits that don't have logs
const ensureHabitsHaveLogs = () => {
  const today = new Date();
  let logsAdded = false;
  
  habits.forEach((habit) => {
    // Check if this habit has any logs
    const existingLogs = habitLogs.filter((log) => log.habit_id === habit.id);
    if (existingLogs.length === 0) {
      // Generate logs for this habit
      const completionRate = habit.isNegative ? (0.2 + Math.random() * 0.2) : (0.7 + Math.random() * 0.2);
      for (let i = 0; i < 365; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, "yyyy-MM-dd");
        
        if (Math.random() < completionRate) {
          habitLogs.push({
            id: `${habit.id}-${dateStr}`,
            habit_id: habit.id,
            date_completed: dateStr,
          });
          logsAdded = true;
        }
      }
      
      // Also generate for sub-habits
      if (habit.subHabits) {
        habit.subHabits.forEach((subHabit) => {
          const subExistingLogs = habitLogs.filter((log) => log.habit_id === subHabit.id);
          if (subExistingLogs.length === 0) {
            for (let i = 0; i < 365; i++) {
              const date = subDays(today, i);
              const dateStr = format(date, "yyyy-MM-dd");
              
              if (Math.random() < completionRate * 0.8) {
                habitLogs.push({
                  id: `${subHabit.id}-${dateStr}`,
                  habit_id: subHabit.id,
                  date_completed: dateStr,
                });
                logsAdded = true;
              }
            }
          }
        });
      }
    }
  });
  
  if (logsAdded) {
    saveHabitLogsToStorage(habitLogs);
  }
};

// Only generate initial data if no logs exist at all
if (habitLogs.length === 0) {
habitLogs = generatePastYearData();
  saveHabitLogsToStorage(habitLogs);
} else {
  // Ensure all current habits have logs (for newly added habits)
  ensureHabitsHaveLogs();
}

// Convert logs array to logs record for a habit
const getLogsRecord = (habitId: string): Record<string, boolean> => {
  const record: Record<string, boolean> = {};
  habitLogs
    .filter((log) => log.habit_id === habitId)
    .forEach((log) => {
      record[log.date_completed] = true;
    });
  return record;
};

// Sync logs record back to habitLogs array
const syncLogsToArray = (habitId: string, logs: Record<string, boolean>) => {
  // Remove existing logs for this habit
  habitLogs = habitLogs.filter((log) => log.habit_id !== habitId);
  // Add new logs
  Object.keys(logs).forEach((date) => {
    if (logs[date]) {
      habitLogs.push({
        id: `${habitId}-${date}`,
        habit_id: habitId,
        date_completed: date,
      });
    }
  });
};

// Recursively sync logs for a habit and its sub-habits
const syncHabitLogs = (habit: Habit) => {
  if (habit.logs) {
    syncLogsToArray(habit.id, habit.logs);
  }
  if (habit.subHabits) {
    habit.subHabits.forEach((subHabit) => {
      syncHabitLogs(subHabit);
    });
  }
};

// Recursively load logs into habits
const loadLogsIntoHabits = (habits: Habit[]): Habit[] => {
  return habits.map((habit) => {
    const logs = getLogsRecord(habit.id);
    const subHabits = habit.subHabits
      ? loadLogsIntoHabits(habit.subHabits)
      : undefined;
    return {
      ...habit,
      logs,
      subHabits,
    };
  });
};

export const getHabits = (): Habit[] => {
  return loadLogsIntoHabits(habits);
};

export const getHabitsByFrequency = (frequency: "daily" | "weekly"): Habit[] => {
  const allHabits = getHabits();
  return allHabits.filter((h) => h.frequency === frequency);
};

export const getHabitLogs = (): HabitLog[] => {
  return habitLogs;
};

export const addHabit = (habit: Omit<Habit, "id" | "created_at">): Habit => {
  const newHabit: Habit = {
    id: Date.now().toString(),
    ...habit,
    logs: habit.logs || {},
    created_at: new Date().toISOString(),
  };
  habits.push(newHabit);
  saveHabitsToStorage(habits);
  return newHabit;
};

export const updateHabit = (
  id: string,
  updates: Partial<Omit<Habit, "id" | "created_at">>
): Habit | null => {
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) return null;
  habits[index] = { ...habits[index], ...updates };
  if (updates.logs) {
    syncHabitLogs(habits[index]);
  }
  saveHabitsToStorage(habits);
  return habits[index];
};

export const deleteHabit = (id: string): boolean => {
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) return false;
  habits.splice(index, 1);
  // Also delete related logs
  habitLogs = habitLogs.filter((log) => log.habit_id !== id);
  saveHabitsToStorage(habits);
  saveHabitLogsToStorage(habitLogs);
  return true;
};

export const reorderHabits = (fromIndex: number, toIndex: number): void => {
  const [removed] = habits.splice(fromIndex, 1);
  habits.splice(toIndex, 0, removed);
  saveHabitsToStorage(habits);
};

export const moveHabitUp = (id: string): boolean => {
  const index = habits.findIndex((h) => h.id === id);
  if (index <= 0) return false;
  const [removed] = habits.splice(index, 1);
  habits.splice(index - 1, 0, removed);
  saveHabitsToStorage(habits);
  return true;
};

export const moveHabitDown = (id: string): boolean => {
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1 || index >= habits.length - 1) return false;
  const [removed] = habits.splice(index, 1);
  habits.splice(index + 1, 0, removed);
  saveHabitsToStorage(habits);
  return true;
};

// Batch submission of pending logs
export const submitPendingLogs = (pendingLogs: PendingLog[]): void => {
  pendingLogs.forEach((pending) => {
    if (pending.completed) {
      // Add log
      const existing = habitLogs.find(
        (log) =>
          log.habit_id === pending.habit_id &&
          log.date_completed === pending.date
      );
      if (!existing) {
        habitLogs.push({
          id: `${pending.habit_id}-${pending.date}`,
          habit_id: pending.habit_id,
          date_completed: pending.date,
        });
      }
    } else {
      // Remove log
      habitLogs = habitLogs.filter(
        (log) =>
          !(
            log.habit_id === pending.habit_id &&
            log.date_completed === pending.date
          )
      );
    }
  });
  saveHabitLogsToStorage(habitLogs);
};

// Update habit logs in memory (for UI state)
export const updateHabitLogs = (
  habitId: string,
  logs: Record<string, boolean>
): void => {
  const habit = habits.find((h) => h.id === habitId);
  if (habit) {
    habit.logs = logs;
    // Also update sub-habits if this is a parent
    if (habit.subHabits) {
      habit.subHabits.forEach((subHabit) => {
        // Parent completion is based on sub-habit completion
        // This is handled in the UI logic
      });
    }
  }
};

export const getHabitLogsByDateRange = (
  startDate: Date,
  endDate: Date
): HabitLog[] => {
  return habitLogs.filter((log) => {
    const logDate = new Date(log.date_completed);
    return logDate >= startDate && logDate <= endDate;
  });
};

// Force refresh habits from storage (useful after external changes)
export const refreshHabits = (): Habit[] => {
  habits = loadHabitsFromStorage();
  habitLogs = loadHabitLogsFromStorage();
  return habits;
};
