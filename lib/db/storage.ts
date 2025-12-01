import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * Upload an image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  folder: string = 'pages'
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // Fall back to base64 for local development
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload a base64 image to Supabase Storage
 * Converts base64 to blob first
 */
export async function uploadBase64Image(
  base64: string,
  folder: string = 'pages'
): Promise<string | null> {
  console.log('uploadBase64Image called, isSupabaseConfigured:', isSupabaseConfigured);
  
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured, returning base64 as-is');
    return base64; // Return as-is for local development
  }

  // If it's already a URL (not base64), return as-is
  if (base64.startsWith('http://') || base64.startsWith('https://') || base64.startsWith('/')) {
    console.log('Already a URL, returning as-is:', base64.substring(0, 50));
    return base64;
  }

  try {
    console.log('Converting base64 to blob...');
    // Convert base64 to blob
    const response = await fetch(base64);
    const blob = await response.blob();
    
    // Determine file extension from mime type
    const mimeType = blob.type;
    const ext = mimeType.split('/')[1] || 'png';
    
    // Generate unique filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    console.log('Uploading to Supabase Storage:', fileName, 'size:', blob.size);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image to Supabase:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    console.log('Upload successful, public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Error converting/uploading base64 image:', err);
    return null;
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true;
  }

  // Extract path from URL
  const match = url.match(/\/images\/(.+)$/);
  if (!match) {
    return false;
  }

  const { error } = await supabase.storage
    .from('images')
    .remove([match[1]]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}

