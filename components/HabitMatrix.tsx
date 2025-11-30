"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Habit } from "@/lib/types";

interface HabitMatrixProps {
  habits: Habit[];
  onLogChange: (habitId: string, date: string, completed: boolean) => void;
  pendingLogs: Map<string, boolean>; // key: "habitId-date", value: completed
}

export default function HabitMatrix({
  habits,
  onLogChange,
  pendingLogs,
}: HabitMatrixProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get completion status for a habit on a specific date
  const isCompleted = (habit: Habit, date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    const key = `${habit.id}-${dateStr}`;
    
    // Check pending logs first (these override existing logs)
    if (pendingLogs.has(key)) {
      return pendingLogs.get(key) === true;
    }
    
    // Check existing logs
    return habit.logs?.[dateStr] === true;
  };

  // Get parent completion status (based on sub-habits)
  const getParentCompletion = (habit: Habit, date: Date): "none" | "partial" | "complete" => {
    if (!habit.subHabits || habit.subHabits.length === 0) {
      return isCompleted(habit, date) ? "complete" : "none";
    }

    const completedCount = habit.subHabits.filter((sub) =>
      isCompleted(sub, date)
    ).length;
    
    if (completedCount === 0) return "none";
    if (completedCount === habit.subHabits.length) return "complete";
    return "partial";
  };

  const handleToggle = (habit: Habit, date: Date, isParent: boolean = false) => {
    if (isParent && habit.subHabits && habit.subHabits.length > 0) {
      // For parent habits, toggle all sub-habits
      const dateStr = format(date, "yyyy-MM-dd");
      const allCompleted = habit.subHabits.every((sub) => isCompleted(sub, date));
      habit.subHabits.forEach((subHabit) => {
        onLogChange(subHabit.id, dateStr, !allCompleted);
      });
    } else {
      const dateStr = format(date, "yyyy-MM-dd");
      const currentlyCompleted = isCompleted(habit, date);
      onLogChange(habit.id, dateStr, !currentlyCompleted);
    }
  };

  const renderHabitRow = (habit: Habit, level: number = 0) => {
    const hasSubHabits = habit.subHabits && habit.subHabits.length > 0;
    const parentCompletion = getParentCompletion(habit, today);

    if (hasSubHabits) {
      return (
        <Accordion type="single" collapsible key={habit.id} className="w-full">
          <AccordionItem value={habit.id} className="border-none">
            <div className="flex items-center">
              {/* Habit Name Column */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-r border-border"
                style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
              >
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <AccordionTrigger className="py-0 hover:no-underline flex-1 text-left">
                  <span className="font-medium">{habit.name}</span>
                </AccordionTrigger>
              </div>

              {/* Date Columns */}
              <ScrollArea className="flex-1">
                <div className="flex">
                  {daysInMonth.map((day) => {
                    const completion = getParentCompletion(habit, day);
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isToday = isSameDay(day, today);

                    return (
                      <div
                        key={dateStr}
                        className={`flex items-center justify-center w-10 h-10 border-r border-b border-border ${
                          isToday ? "bg-muted/50" : ""
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition-colors ${
                            completion === "complete"
                              ? "bg-green-500"
                              : completion === "partial"
                              ? "bg-green-500/50"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          onClick={() => handleToggle(habit, day, true)}
                          title={`${habit.name} - ${format(day, "MMM d")} - Click to toggle all sub-habits`}
                        >
                          {completion !== "none" && (
                            <span className="text-xs text-white">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <AccordionContent>
              <div className="border-t border-border">
                {habit.subHabits?.map((subHabit) => renderHabitRow(subHabit, level + 1))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    // Regular habit row (no sub-habits)
    return (
      <div
        key={habit.id}
        className="flex items-center border-b border-border"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {/* Habit Name Column */}
        <div className="flex items-center gap-2 px-4 py-3 border-r border-border min-w-[200px]">
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color }}
          />
          <span className="font-medium">{habit.name}</span>
        </div>

        {/* Date Columns */}
        <ScrollArea className="flex-1">
          <div className="flex">
            {daysInMonth.map((day) => {
              const completed = isCompleted(habit, day);
              const dateStr = format(day, "yyyy-MM-dd");
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={dateStr}
                  className={`flex items-center justify-center w-10 h-10 border-r border-border ${
                    isToday ? "bg-muted/50" : ""
                  }`}
                >
                  <Checkbox
                    checked={completed}
                    onCheckedChange={() => handleToggle(habit, day)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {format(today, "MMMM yyyy")} - Habit Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="flex items-center border-b border-border bg-muted/30 sticky top-0 z-10">
            <div className="px-4 py-3 border-r border-border min-w-[200px] font-medium">
              Habit
            </div>
            <ScrollArea className="flex-1">
              <div className="flex">
                {daysInMonth.map((day) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={format(day, "yyyy-MM-dd")}
                      className={`flex flex-col items-center justify-center w-10 h-12 border-r border-border ${
                        isToday ? "bg-primary/10 font-semibold" : ""
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {format(day, "EEE")}
                      </span>
                      <span className="text-sm">{format(day, "d")}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Habit Rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {habits.map((habit) => renderHabitRow(habit))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

