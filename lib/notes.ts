// Notes management - stores visitor notes
export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

// Check if we're in browser
const isBrowser = typeof window !== "undefined";

// Load notes from localStorage
const loadNotesFromStorage = (): Note[] => {
  if (isBrowser) {
    const stored = localStorage.getItem("websiteNotes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
      } catch (e) {
        console.error("Failed to parse notes from localStorage", e);
      }
    }
  }
  return [];
};

// Save notes to localStorage
const saveNotesToStorage = (notesToSave: Note[]) => {
  if (isBrowser) {
    localStorage.setItem("websiteNotes", JSON.stringify(notesToSave));
  }
};

let notes: Note[] = loadNotesFromStorage();

export const getNotes = (): Note[] => {
  return notes;
};

export const addNote = (content: string): Note => {
  const newNote: Note = {
    id: Date.now().toString(),
    content,
    createdAt: new Date(),
  };
  notes.push(newNote);
  saveNotesToStorage(notes);
  return newNote;
};

export const deleteNote = (id: string): boolean => {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  saveNotesToStorage(notes);
  return true;
};

export const clearAllNotes = (): void => {
  notes = [];
  saveNotesToStorage(notes);
};

// Get all notes as formatted text for display
export const getNotesAsText = (): string => {
  if (notes.length === 0) {
    return "No notes yet.";
  }
  return notes
    .map((n) => `[${n.createdAt.toLocaleString()}]\n${n.content}`)
    .join("\n\n---\n\n");
};

