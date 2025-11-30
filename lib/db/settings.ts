import { supabase } from '../supabase';

export interface SongSetting {
  title: string;
  artist: string;
  albumCover: string;
  spotifyUrl: string;
}

export async function getCurrentSong(): Promise<SongSetting> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'current_song')
    .single();
  
  if (error || !data) {
    // Return default
    return {
      title: "Don't Look Back in Anger",
      artist: "Oasis",
      albumCover: "/dontlookbackinanger.jpg",
      spotifyUrl: "https://open.spotify.com/track/7CVYxHq1L0Z4G84jTDS6Jl",
    };
  }
  
  return data.value as SongSetting;
}

export async function updateCurrentSong(song: SongSetting): Promise<boolean> {
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

