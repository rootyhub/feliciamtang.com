"use client";

import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { useState } from "react";

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

const mockHabits: Habit[] = [
  { id: "1", name: "Read 30 mins", streak: 7, completed: false },
  { id: "2", name: "Workout", streak: 12, completed: false },
  { id: "3", name: "Meditate", streak: 5, completed: false },
  { id: "4", name: "Write", streak: 3, completed: false },
];

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <h2 className="mb-6 text-xl font-semibold tracking-tight">
        Daily Habits
      </h2>
      <div className="space-y-3">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                  habit.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {habit.completed && <Check className="h-3 w-3" />}
              </button>
              <span
                className={`font-medium ${
                  habit.completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                {habit.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{habit.streak} days</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

