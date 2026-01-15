"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { Settings, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader } from "./ui/card";
import { getHabits, submitHabitLogs } from "@/lib/db/habits";
import { checkAdmin } from "@/lib/auth";
import { Habit, PendingLog } from "@/lib/types";
import Link from "next/link";

export default function WeeklyHabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [pendingLogs, setPendingLogs] = useState<Map<string, boolean>>(new Map());
  const [lastSubmitted, setLastSubmitted] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  const today = new Date();
  const displayWeekBase = addWeeks(today, weekOffset);
  const weekStart = startOfWeek(displayWeekBase, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(displayWeekBase, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const isCurrentWeek = weekOffset === 0;

  useEffect(() => {
    setIsAdmin(checkAdmin());
    const loadHabits = async () => {
      const habitsData = await getHabits();
      setHabits(habitsData);
    };
    loadHabits();
    const interval = setInterval(loadHabits, 5000);
    return () => clearInterval(interval);
  }, []);

  const isCompleted = (habit: Habit, date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    const key = `${habit.id}-${dateStr}`;
    
    if (pendingLogs.has(key)) {
      return pendingLogs.get(key) === true;
    }
    
    return habit.logs?.[dateStr] === true;
  };

  // Find a habit by ID, including sub-habits
  const findHabitById = (habitId: string): Habit | undefined => {
    for (const habit of habits) {
      if (habit.id === habitId) return habit;
      if (habit.subHabits) {
        const subHabit = habit.subHabits.find((s) => s.id === habitId);
        if (subHabit) return subHabit;
      }
    }
    return undefined;
  };

  const handleToggle = (habitId: string, date: Date) => {
    if (!isAdmin) return;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const key = `${habitId}-${dateStr}`;
    const habit = findHabitById(habitId);
    if (!habit) return;
    
    const currentlyCompleted = isCompleted(habit, date);

    setPendingLogs((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, !currentlyCompleted);
      return newMap;
    });
  };

  const handleSubmit = async () => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    
    const logsToSubmit: PendingLog[] = [];
    pendingLogs.forEach((completed, key) => {
      // Key format is "habitId-yyyy-MM-dd", so we need to find the date portion
      // Date is always in format yyyy-MM-dd (10 chars) at the end
      const dateStart = key.length - 10;
      const habitId = key.substring(0, dateStart - 1); // -1 to remove the separator dash
      const date = key.substring(dateStart);
      
      logsToSubmit.push({
        habit_id: habitId,
        date: date,
        completed,
      });
    });

    await submitHabitLogs(logsToSubmit);
    setPendingLogs(new Map());
    setLastSubmitted(new Date());
    const habitsData = await getHabits();
    setHabits(habitsData);
    setIsSubmitting(false);
  };

  const toggleExpand = (habitId: string) => {
    setExpandedHabits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const hasPendingChanges = pendingLogs.size > 0;

  const renderHabitRow = (habit: Habit, isSubHabit: boolean = false) => {
    const hasSubHabits = habit.subHabits && habit.subHabits.length > 0;
    const isExpanded = expandedHabits.has(habit.id);

    return (
      <div key={habit.id} className="py-1">
        <div className="grid grid-cols-[minmax(120px,1fr)_24px_repeat(7,24px)] sm:grid-cols-[minmax(140px,1fr)_32px_repeat(7,32px)] gap-1 items-center">
          {/* Habit name column - horizontal scroll for long names */}
          <div className={`flex items-center overflow-x-auto min-w-0 ${isSubHabit ? "pl-4 sm:pl-6" : ""}`}>
            <span className={`text-[10px] sm:text-sm whitespace-nowrap ${habit.isNegative ? "text-red-600" : ""}`}>
              {habit.name}
            </span>
          </div>
          
          {/* Chevron column - aligned left of Sunday checkbox */}
          <div className="flex justify-center flex-shrink-0">
            {hasSubHabits && (
              <button
                onClick={() => toggleExpand(habit.id)}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3" />
                ) : (
                  <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3" />
                )}
              </button>
            )}
          </div>
          
          {/* Weekday checkboxes - always aligned */}
          {weekDays.map((day) => (
            <div key={format(day, "yyyy-MM-dd")} className="flex justify-center flex-shrink-0">
              <Checkbox
                checked={isCompleted(habit, day)}
                onCheckedChange={() => handleToggle(habit.id, day)}
                disabled={!isAdmin}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  habit.isNegative ? "data-[state=checked]:bg-red-600" : "data-[state=checked]:bg-primary"
                }`}
              />
            </div>
          ))}
        </div>
        
        {hasSubHabits && isExpanded && (
          <div className="mt-1">
            {habit.subHabits?.map((subHabit) => renderHabitRow(subHabit, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-auto min-h-[300px] md:h-full overflow-hidden">
      <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden p-2 sm:p-3">
        {/* Horizontal scroll wrapper for small screens */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="min-w-[400px]">
            {/* Header row - compact */}
            <div className="bg-muted inner-card-grey-muted px-1 sm:px-2 py-0.5 mb-1 flex-shrink-0 border-3d">
              <div className="grid grid-cols-[minmax(120px,1fr)_24px_repeat(7,24px)] sm:grid-cols-[minmax(140px,1fr)_32px_repeat(7,32px)] gap-1 text-[8px] sm:text-[10px] font-bold">
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <button
                      onClick={() => setWeekOffset(weekOffset - 1)}
                      className="px-1 py-0.5 hover:bg-muted-foreground/20 rounded text-[10px] sm:text-xs flex-shrink-0"
                      title="Previous week"
                    >
                      ←
                    </button>
                  )}
                  <span className={`${!isCurrentWeek ? "text-amber-600" : ""} text-[10px] sm:text-xs whitespace-nowrap`}>
                    {format(weekStart, "M/d/yyyy")}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => setWeekOffset(weekOffset + 1)}
                      disabled={weekOffset >= 0}
                      className="px-1 py-0.5 hover:bg-muted-foreground/20 rounded disabled:opacity-30 disabled:cursor-not-allowed text-[10px] sm:text-xs flex-shrink-0"
                      title="Next week"
                    >
                      →
                    </button>
                  )}
                  {!isCurrentWeek && isAdmin && (
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="ml-1 text-[9px] sm:text-[10px] underline hover:text-primary flex-shrink-0"
                    >
                      today
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0"></div>
                {weekDays.map((day) => (
                  <div
                    key={format(day, "yyyy-MM-dd")}
                    className={`text-center flex-shrink-0 ${
                      isSameDay(day, today) ? "underline" : ""
                    }`}
                  >
                    {format(day, "EEE").substring(0, 1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Habits list - aligned with header text */}
            <div className="px-1 sm:px-2">
              {habits.length === 0 ? (
                <p className="text-xs text-center py-4">No habits yet.</p>
              ) : (
                habits.map((habit) => renderHabitRow(habit))
              )}
            </div>
          </div>
        </div>

        {/* Submit footer */}
        {isAdmin && (
          <div className="mt-2 pt-2 border-t border-border bg-muted inner-card-grey-muted p-1 sm:p-2 flex-shrink-0 overflow-hidden border-3d">
            <div className="flex items-center justify-between text-[10px] sm:text-xs flex-wrap gap-2 min-w-0">
              <div className="truncate min-w-0">
                {lastSubmitted
                  ? `Last: ${format(lastSubmitted, "MMM d, h:mm a")}`
                  : "No submissions"}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!hasPendingChanges || isSubmitting}
                className="h-6 px-3 text-[10px] font-bold uppercase bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderTopColor: 'white',
                  borderRightColor: 'white',
                  borderBottomColor: '#a09890',
                  borderLeftColor: '#a09890',
                }}
              >
                {isSubmitting ? "..." : "SUBMIT"}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
