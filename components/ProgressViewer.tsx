"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format, startOfYear, endOfYear, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { getHabits } from "@/lib/db/habits";
import { Habit } from "@/lib/types";

export default function ProgressViewer() {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const today = new Date();

  // Load habits from Supabase
  useEffect(() => {
    const loadHabits = async () => {
      const habitsData = await getHabits();
      setHabits(habitsData);
    };
    loadHabits();
    const interval = setInterval(loadHabits, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get all habits including sub-habits (for popover display)
  const getAllHabitsFlat = (habitsList: Habit[]): Habit[] => {
    const flat: Habit[] = [];
    habitsList.forEach((habit) => {
      flat.push(habit);
      if (habit.subHabits && habit.subHabits.length > 0) {
        habit.subHabits.forEach((sub) => flat.push(sub));
      }
    });
    return flat;
  };

  // Get only parent-level habits (for percentage calculation)
  // A habit with sub-habits is considered "complete" if ANY of its sub-habits are complete
  const getParentHabitsOnly = (habitsList: Habit[]): Habit[] => {
    return habitsList.map((habit) => {
      // Return the habit as-is (parent level only)
      return habit;
    });
  };

  // Check if a parent habit is completed for a given date
  // For habits with sub-habits, it's complete if the parent is checked OR ANY sub-habit is complete
  const isHabitCompletedForDate = (habit: Habit, dateStr: string): boolean => {
    // First check if the parent habit itself is completed
    if (habit.logs?.[dateStr] === true) {
      return true;
    }
    // If it has sub-habits, also check if any sub-habit is completed
    if (habit.subHabits && habit.subHabits.length > 0) {
      return habit.subHabits.some((sub) => sub.logs?.[dateStr] === true);
    }
    return false;
  };

  const allHabitsFlat = getAllHabitsFlat(habits); // For popover display
  const parentHabits = getParentHabitsOnly(habits); // For percentage calculation
  const positiveHabits = parentHabits.filter((h) => !h.isNegative);
  const negativeHabits = parentHabits.filter((h) => h.isNegative);

  // Yearly data - all days of the year
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const yearlyData = useMemo(() => {
    return yearDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      
      let positiveCompleted = 0;
      let positiveTotal = 0;
      let negativeCompleted = 0;
      let negativeTotal = 0;
      
      positiveHabits.forEach((habit) => {
        positiveTotal++;
        if (isHabitCompletedForDate(habit, dateStr)) {
          positiveCompleted++;
        }
      });
      
      negativeHabits.forEach((habit) => {
        negativeTotal++;
        if (isHabitCompletedForDate(habit, dateStr)) {
          negativeCompleted++;
        }
      });

      const positiveRate = positiveTotal > 0 ? (positiveCompleted / positiveTotal) * 100 : 0;
      const negativeRate = negativeTotal > 0 ? (negativeCompleted / negativeTotal) * 100 : 0;
      
      return {
        day,
        positiveRate,
        negativeRate,
      };
    });
  }, [yearDays, positiveHabits, negativeHabits]);

  // Monthly data
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyData = useMemo(() => {
    return monthDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      
      let positiveCompleted = 0;
      let positiveTotal = 0;
      let negativeCompleted = 0;
      let negativeTotal = 0;
      
      positiveHabits.forEach((habit) => {
        positiveTotal++;
        if (isHabitCompletedForDate(habit, dateStr)) {
          positiveCompleted++;
        }
      });
      
      negativeHabits.forEach((habit) => {
        negativeTotal++;
        if (isHabitCompletedForDate(habit, dateStr)) {
          negativeCompleted++;
        }
      });

      const positiveRate = positiveTotal > 0 ? (positiveCompleted / positiveTotal) * 100 : 0;
      const negativeRate = negativeTotal > 0 ? (negativeCompleted / negativeTotal) * 100 : 0;
      
      return {
        day,
        positiveRate,
        negativeRate,
      };
    });
  }, [monthDays, positiveHabits, negativeHabits]);

  // Get breakdown for a specific date (shows all habits including sub-habits)
  const getDateBreakdown = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const completed: { habit: Habit; isNegative: boolean; isSubHabit: boolean }[] = [];
    
    // Check all habits including sub-habits for the popover display
    allHabitsFlat.forEach((habit) => {
      if (habit.logs?.[dateStr] === true) {
        // Determine if this is a sub-habit by checking if its id contains a dash (e.g., "2-1")
        const isSubHabit = habit.id.includes("-") && habit.id.split("-").length > 1 && !isNaN(Number(habit.id.split("-")[1]));
        completed.push({ habit, isNegative: habit.isNegative || false, isSubHabit });
      }
    });
    
    return completed;
  };

  // Scroll to today's position on mount for yearly view
  useEffect(() => {
    if (viewMode === "yearly" && scrollContainerRef.current) {
      // Scroll to the right (today's position) after a short delay to ensure render
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 100);
    }
  }, [viewMode]);

  return (
    <Card className="flex flex-col h-auto min-h-[300px] overflow-hidden">
      <CardContent className="flex-1 flex flex-col min-h-0 p-2 sm:p-3 overflow-hidden">
        {/* Legend with view mode toggle - compact */}
        <div className="bg-muted inner-card-grey-muted px-1 sm:px-2 py-0.5 mb-1 text-[8px] sm:text-[10px] flex-shrink-0 overflow-hidden border-3d">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 border border-border flex-shrink-0"></div>
                <span className="whitespace-nowrap">Good ↑</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 border border-border flex-shrink-0"></div>
                <span className="whitespace-nowrap">Bad ↓</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-2 py-0.5 text-[8px] sm:text-[10px] font-bold border-3d ${
                  viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-card inner-card-grey"
                }`}
              >
                MONTH
              </button>
              <button
                onClick={() => setViewMode("yearly")}
                className={`px-2 py-0.5 text-[8px] sm:text-[10px] font-bold border-3d ${
                  viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-card inner-card-grey"
                }`}
              >
                YEAR
              </button>
            </div>
          </div>
        </div>

        {viewMode === "yearly" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chart container - with horizontal scroll */}
            <div className="flex-1 flex relative min-h-0 overflow-hidden">
              {/* Y-axis */}
              <div className="w-8 sm:w-10 flex flex-col justify-between text-[8px] sm:text-[10px] font-bold pr-1 flex-shrink-0">
                <span>100</span>
                <span>50</span>
                <span>0</span>
                <span>-50</span>
                <span>-100</span>
              </div>
              
              {/* Graph area - with horizontal scroll */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 relative border-l border-b border-border min-w-0 overflow-x-auto overflow-y-hidden"
              >
                {/* Zero line - exactly at 50% */}
                <div className="absolute left-0 border-t border-border z-10 pointer-events-none" style={{ top: '50%', width: '1460px' }} />
                
                {/* Bars container - 365 days, 4px each = 1460px total width */}
                <div className="h-full flex gap-0" style={{ width: '1460px' }}>
                  {yearlyData.map((dayData, index) => {
                    const isToday = format(dayData.day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                    const breakdown = getDateBreakdown(dayData.day);
                    
                    return (
                      <Popover key={format(dayData.day, "yyyy-MM-dd")}>
                        <PopoverTrigger asChild>
                          <button
                            className="relative h-full cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                            style={{ width: '4px' }}
                            onClick={() => setSelectedDate(dayData.day)}
                          >
                            {/* Positive bar - grows UP from center (50%) */}
                            {dayData.positiveRate > 0 && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(dayData.positiveRate / 100) * 50}%` }}
                                transition={{ duration: 0.3, delay: index * 0.001 }}
                                className="absolute left-0 right-0 bg-green-500 pointer-events-none"
                                style={{ bottom: '50%' }}
                              />
                            )}
                            
                            {/* Negative bar - grows DOWN from center (50%) */}
                            {dayData.negativeRate > 0 && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(dayData.negativeRate / 100) * 50}%` }}
                                transition={{ duration: 0.3, delay: index * 0.001 }}
                                className="absolute left-0 right-0 bg-red-500 pointer-events-none"
                                style={{ top: '50%' }}
                              />
                            )}
                            
                            {/* Today marker */}
                            {isToday && (
                              <div className="absolute inset-0 bg-primary opacity-30 z-20 pointer-events-none" />
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-56 p-2 text-xs border-3d" 
                          align="start"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-[10px] mb-2 border-b border-border pb-1">
                              {format(dayData.day, "MMM d, yyyy")}
                            </div>
                            {breakdown.length > 0 ? (
                              <div className="space-y-0.5">
                                {breakdown.map((item, idx) => (
                                  <div 
                                    key={idx}
                                    className={`text-[10px] flex items-center gap-1 ${
                                      item.isNegative ? "text-red-600" : "text-green-600"
                                    } ${item.isSubHabit ? "ml-3" : ""}`}
                                  >
                                    <span className={`${item.isSubHabit ? "w-1 h-1" : "w-1.5 h-1.5"} rounded-full bg-current flex-shrink-0`} />
                                    <span>{item.habit.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-muted-foreground">
                                No habits logged
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div className="mt-1 sm:mt-2 ml-8 sm:ml-10 flex justify-between text-[8px] sm:text-[10px] font-bold pt-1 flex-shrink-0">
              <span>JAN 1</span>
              <span className="px-2">{format(today, "yyyy")}</span>
              <span>DEC 31</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chart container - no overflow here */}
            <div className="flex-1 flex relative min-h-0">
              {/* Y-axis */}
              <div className="w-8 sm:w-10 flex flex-col justify-between text-[8px] sm:text-[10px] font-bold pr-1 flex-shrink-0">
                <span>100</span>
                <span>50</span>
                <span>0</span>
                <span>-50</span>
                <span>-100</span>
              </div>
              
              {/* Graph area - fixed height, no scroll */}
              <div className="flex-1 relative border-l border-b border-border min-w-0">
                {/* Zero line - exactly at 50% */}
                <div className="absolute left-0 right-0 border-t border-border z-10" style={{ top: '50%' }} />
                
                {/* Bars container - no overflow */}
                <div className="absolute inset-0 flex gap-[1px]">
                  {monthlyData.map((day, index) => {
                    const isToday = format(day.day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                    const breakdown = getDateBreakdown(day.day);
                    
                    return (
                      <Popover key={format(day.day, "yyyy-MM-dd")}>
                        <PopoverTrigger asChild>
                          <button
                            className="flex-1 relative h-full cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedDate(day.day)}
                          >
                            {/* Positive bar - grows UP from center (50%) */}
                            {day.positiveRate > 0 && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(day.positiveRate / 100) * 50}%` }}
                                transition={{ duration: 0.1, delay: index * 0.005 }}
                                className="absolute left-0 right-0 bg-green-500 pointer-events-none"
                                style={{ bottom: '50%' }}
                              />
                            )}
                            
                            {/* Negative bar - grows DOWN from center (50%) */}
                            {day.negativeRate > 0 && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(day.negativeRate / 100) * 50}%` }}
                                transition={{ duration: 0.1, delay: index * 0.005 }}
                                className="absolute left-0 right-0 bg-red-500 pointer-events-none"
                                style={{ top: '50%' }}
                              />
                            )}
                            
                            {/* Today marker */}
                            {isToday && (
                              <div className="absolute inset-0 ring-1 sm:ring-2 ring-primary z-20 pointer-events-none" />
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-56 p-2 text-xs border-3d" 
                          align="start"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-[10px] mb-2 border-b border-border pb-1">
                              {format(day.day, "MMM d, yyyy")}
                            </div>
                            {breakdown.length > 0 ? (
                              <div className="space-y-0.5">
                                {breakdown.map((item, idx) => (
                                  <div 
                                    key={idx}
                                    className={`text-[10px] flex items-center gap-1 ${
                                      item.isNegative ? "text-red-600" : "text-green-600"
                                    } ${item.isSubHabit ? "ml-3" : ""}`}
                                  >
                                    <span className={`${item.isSubHabit ? "w-1 h-1" : "w-1.5 h-1.5"} rounded-full bg-current flex-shrink-0`} />
                                    <span>{item.habit.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-muted-foreground">
                                No habits logged
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div className="mt-1 sm:mt-2 ml-8 sm:ml-10 flex justify-between text-[8px] sm:text-[10px] font-bold pt-1 flex-shrink-0">
              <span>1</span>
              <span className="truncate">{format(today, "MMM yyyy").toUpperCase()}</span>
              <span>{format(monthEnd, "d")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
