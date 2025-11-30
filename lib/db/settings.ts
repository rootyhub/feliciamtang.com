import { supabase, isSupabaseConfigured } from '../supabase';

export interface SongSetting {
  title: string;
  artist: string;
  albumCover: string;
  spotifyUrl: string;
}

const DEFAULT_SONG: SongSetting = {
  title: "Don't Look Back in Anger",
  artist: "Oasis",
  albumCover: "/dontlookbackinanger.jpg",
  spotifyUrl: "https://open.spotify.com/track/7CVYxHq1L0Z4G84jTDS6Jl",
};

// localStorage fallback for settings
const getLocalSetting = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(`setting_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalSetting = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`setting_${key}`, JSON.stringify(value));
};

export async function getCurrentSong(): Promise<SongSetting> {
  if (!isSupabaseConfigured) {
    return getLocalSetting('current_song', DEFAULT_SONG);
  }

  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'current_song')
    .single();
  
  if (error || !data) {
    return DEFAULT_SONG;
  }
  
  return data.value as SongSetting;
}

export async function updateCurrentSong(song: SongSetting): Promise<boolean> {
  if (!isSupabaseConfigured) {
    setLocalSetting('current_song', song);
    return true;
  }

  const { error } = await supabase
    .from('settings')
    .upsert({
      key: 'current_song',
      value: song,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'key',
    });
  
  if (error) {
    console.error('Error updating song:', error);
    return false;
  }
  
  return true;
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  if (!isSupabaseConfigured) {
    return getLocalSetting(key, defaultValue);
  }

  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error || !data) {
    return defaultValue;
  }
  
  return data.value as T;
}

export async function setSetting<T>(key: string, value: T): Promise<boolean> {
  if (!isSupabaseConfigured) {
    setLocalSetting(key, value);
    return true;
  }

  const { error } = await supabase
    .from('settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'key',
    });
  
  if (error) {
    console.error('Error setting value:', error);
    return false;
  }
  
  return true;
}

