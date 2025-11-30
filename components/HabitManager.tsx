"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Settings } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
} from "@/lib/habits";
import { Habit } from "@/lib/types";

const HABIT_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
];

export default function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const handleAddHabit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;
    const frequency = (formData.get("frequency") as "daily" | "weekly") || "daily";
    const goalPerWeek = frequency === "weekly" 
      ? parseInt(formData.get("goal_per_week") as string) || 1
      : undefined;

    if (name.trim()) {
      addHabit({
        name: name.trim(),
        color: color || HABIT_COLORS[0],
        frequency,
        goal_per_week: goalPerWeek,
        logs: {},
      });
      setHabits(getHabits());
      setIsAddDialogOpen(false);
      e.currentTarget.reset();
    }
  };

  const handleEditHabit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingHabit) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;
    const frequency = (formData.get("frequency") as "daily" | "weekly") || editingHabit.frequency;
    const goalPerWeek = frequency === "weekly" 
      ? parseInt(formData.get("goal_per_week") as string) || 1
      : undefined;

    if (name.trim()) {
      updateHabit(editingHabit.id, {
        name: name.trim(),
        color: color || editingHabit.color,
        frequency,
        goal_per_week: goalPerWeek,
      });
      setHabits(getHabits());
      setIsEditDialogOpen(false);
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(id);
      setHabits(getHabits());
    }
  };

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simple password check - replace with proper auth later
    if (password === "admin") {
      setIsAuthenticated(true);
      setShowAuth(false);
      setPassword("");
    } else {
      alert("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Habit Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showAuth} onOpenChange={setShowAuth}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Manage Habits
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Password</DialogTitle>
                  <DialogDescription>
                    Please enter the password to manage habits.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuth}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Authenticate</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <p className="mt-4 text-xs text-muted-foreground">
              Password: &quot;admin&quot; (for demo)
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Habit Manager
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Habit Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
                <DialogDescription>
                  Create a new habit to track daily.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddHabit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Habit Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Read 30 mins"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      id="frequency"
                      name="frequency"
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue="daily"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      {HABIT_COLORS.map((color) => (
                        <label key={color} className="cursor-pointer">
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            defaultChecked={color === HABIT_COLORS[0]}
                            className="sr-only"
                          />
                          <div
                            className="h-8 w-8 rounded-full border-2 border-transparent transition-all hover:scale-110"
                            style={{ backgroundColor: color }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2" id="goal-per-week-container">
                    <Label htmlFor="goal_per_week">Goal per Week (for weekly habits)</Label>
                    <Input
                      id="goal_per_week"
                      name="goal_per_week"
                      type="number"
                      min="1"
                      max="7"
                      defaultValue="1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Habit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Habits List */}
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div>
                    <p className="font-medium">{habit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {habit.frequency === "daily" ? "Daily" : `Weekly (${habit.goal_per_week || 1}/week)`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={isEditDialogOpen && editingHabit?.id === habit.id}
                    onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (open) {
                        setEditingHabit(habit);
                      } else {
                        setEditingHabit(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Habit</DialogTitle>
                        <DialogDescription>
                          Update the habit details.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditHabit}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Habit Name</Label>
                            <Input
                              id="edit-name"
                              name="name"
                              defaultValue={habit.name}
                              required
                              autoFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-frequency">Frequency</Label>
                            <select
                              id="edit-frequency"
                              name="frequency"
                              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue={habit.frequency}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-color">Color</Label>
                            <div className="flex gap-2">
                              {HABIT_COLORS.map((color) => (
                                <label key={color} className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name="color"
                                    value={color}
                                    defaultChecked={color === habit.color}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                                      color === habit.color
                                        ? "border-primary"
                                        : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-goal_per_week">
                              Goal per Week (for weekly habits)
                            </Label>
                            <Input
                              id="edit-goal_per_week"
                              name="goal_per_week"
                              type="number"
                              min="1"
                              max="7"
                              defaultValue={habit.goal_per_week || 1}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

