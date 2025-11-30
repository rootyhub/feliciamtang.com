import { supabase, isSupabaseConfigured } from '../supabase';
import * as localNotes from '../notes';

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export async function getNotes(): Promise<Note[]> {
  if (!isSupabaseConfigured) {
    return localNotes.getNotes();
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching notes:', error);
    return localNotes.getNotes();
  }
  
  return data.map((row: any) => ({
    id: row.id,
    content: row.content,
    createdAt: new Date(row.created_at),
  }));
}

export async function addNote(content: string): Promise<Note | null> {
  if (!isSupabaseConfigured) {
    return localNotes.addNote(content);
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({ content })
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error adding note:', error);
    return null;
  }
  
  return {
    id: data.id,
    content: data.content,
    createdAt: new Date(data.created_at),
  };
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    localNotes.deleteNote(id);
    return true;
  }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting note:', error);
    return false;
  }
  
  return true;
}

