"use client";

import { useMemo } from "react";
import { format, startOfYear, endOfYear, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getHabits, getHabitLogs } from "@/lib/habits";

export default function YearlyVolumeGraph() {
  const today = new Date();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 0 });

  const habits = getHabits();
  const logs = getHabitLogs();

  // Calculate completion rate for each week
  const weeklyData = useMemo(() => {
    if (habits.length === 0) {
      return weeks.map((weekStart) => ({
        weekStart,
        weekEnd: endOfWeek(weekStart, { weekStartsOn: 0 }),
        completed: 0,
        totalPossible: 0,
        completionRate: 0,
      }));
    }

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      // Count total possible completions (habits × days in week)
      const totalPossible = habits.length * weekDays.length;
      
      // Count actual completions for this week
      let completed = 0;
      weekDays.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        habits.forEach((habit) => {
          if (habit.logs?.[dateStr] === true) {
            completed++;
          }
        });
      });

      const completionRate = totalPossible > 0 ? completed / totalPossible : 0;
      
      return {
        weekStart,
        weekEnd,
        completed,
        totalPossible,
        completionRate,
      };
    });
  }, [weeks, habits]);

  const maxCompletion = Math.max(
    ...weeklyData.map((d) => d.completed),
    1
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Yearly Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex items-end gap-1 overflow-x-auto pb-2">
          {weeklyData.map((week, index) => {
            const height = (week.completed / maxCompletion) * 100;
            const isCurrentWeek =
              week.weekStart <= today && week.weekEnd >= today;

            return (
              <motion.div
                key={format(week.weekStart, "yyyy-MM-dd")}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.3, delay: index * 0.01 }}
                className={`flex-1 min-w-[8px] rounded-t transition-colors ${
                  week.completionRate === 1
                    ? "bg-green-500"
                    : week.completionRate >= 0.7
                    ? "bg-green-500/70"
                    : week.completionRate >= 0.5
                    ? "bg-green-500/50"
                    : week.completionRate > 0
                    ? "bg-green-500/30"
                    : "bg-muted"
                } ${isCurrentWeek ? "ring-2 ring-primary" : ""}`}
                title={`Week of ${format(week.weekStart, "MMM d")}: ${week.completed}/${week.totalPossible} (${Math.round(week.completionRate * 100)}%)`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
          <span>Jan</span>
          <span>Year {format(today, "yyyy")}</span>
          <span>Dec</span>
        </div>
      </CardContent>
    </Card>
  );
}

