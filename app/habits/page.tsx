"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HabitMatrix from "@/components/HabitMatrix";
import { getHabitsByFrequency, submitPendingLogs } from "@/lib/habits";
import { Habit, PendingLog } from "@/lib/types";

export default function HabitsPage() {
  const [dailyHabits, setDailyHabits] = useState<Habit[]>([]);
  const [weeklyHabits, setWeeklyHabits] = useState<Habit[]>([]);
  const [pendingLogs, setPendingLogs] = useState<Map<string, boolean>>(
    new Map()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const refreshHabits = () => {
      setDailyHabits(getHabitsByFrequency("daily"));
      setWeeklyHabits(getHabitsByFrequency("weekly"));
    };
    refreshHabits();
    // Refresh every 2 seconds to catch changes
    const interval = setInterval(refreshHabits, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogChange = (
    habitId: string,
    date: string,
    completed: boolean
  ) => {
    const key = `${habitId}-${date}`;
    setPendingLogs((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, completed);
      return newMap;
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Convert pending logs to PendingLog array
    const logsToSubmit: PendingLog[] = [];
    pendingLogs.forEach((completed, key) => {
      // Key format: "habitId-yyyy-MM-dd"
      const lastDashIndex = key.lastIndexOf("-");
      const habitId = key.substring(0, lastDashIndex);
      const date = key.substring(lastDashIndex + 1);
      
      // Reconstruct date string (yyyy-MM-dd)
      const dateParts = date.split("-");
      if (dateParts.length === 3) {
        logsToSubmit.push({
          habit_id: habitId,
          date: date,
          completed,
        });
      }
    });

    // Submit to backend (mock for now)
    submitPendingLogs(logsToSubmit);

    // Clear pending logs
    setPendingLogs(new Map());

    // Refresh habits
    setDailyHabits(getHabitsByFrequency("daily"));
    setWeeklyHabits(getHabitsByFrequency("weekly"));

    setIsSubmitting(false);
  };

  const hasPendingChanges = pendingLogs.size > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Habit Tracker
              </h1>
              <p className="mt-2 text-muted-foreground">
                Track your daily and weekly habits in a matrix view
              </p>
            </div>
          </div>

          {/* Daily Habits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-2xl font-semibold">Daily Habits</h2>
            {dailyHabits.length > 0 ? (
              <HabitMatrix
                habits={dailyHabits}
                onLogChange={handleLogChange}
                pendingLogs={pendingLogs}
              />
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                No daily habits yet. Add some in the Habit Manager!
              </div>
            )}
          </motion.div>

          {/* Weekly Habits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-2xl font-semibold">Weekly Habits</h2>
            {weeklyHabits.length > 0 ? (
              <HabitMatrix
                habits={weeklyHabits}
                onLogChange={handleLogChange}
                pendingLogs={pendingLogs}
              />
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                No weekly habits yet. Add some in the Habit Manager!
              </div>
            )}
          </motion.div>

          {/* Sticky Submit Button */}
          {hasPendingChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-4 z-50 mt-8"
            >
              <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-lg">
                  <div>
                    <p className="font-medium">
                      {pendingLogs.size} change{pendingLogs.size !== 1 ? "s" : ""}{" "}
                      pending
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click submit to save your changes
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

