"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([
        {
          id: Date.now().toString(),
          content: newNote.trim(),
          createdAt: new Date(),
        },
        ...notes,
      ]);
      setNewNote("");
      setIsAdding(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Notes</CardTitle>
        {!isAdding && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {isAdding ? (
          <div className="space-y-2">
            <Input
              placeholder="Write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote();
                } else if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewNote("");
                }
              }}
              autoFocus
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} size="sm">
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto space-y-2 mt-2">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notes yet. Click the + button to add one.
            </p>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-lg border border-border bg-muted/50 p-3 text-sm"
              >
                <p className="pr-8">{note.content}</p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

