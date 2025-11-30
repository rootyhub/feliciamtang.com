import { supabase } from '../supabase';
import { Page } from '../types';

// Convert DB row to Page type
const toPage = (row: any): Page => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  headingImage: row.heading_image,
  body: row.body,
  excerpt: row.excerpt,
  images: row.images || [],
  createdAt: new Date(row.created_at),
  isFeatured: row.is_featured,
  externalUrl: row.external_url,
  layout: row.layout,
  published: row.published,
});

// Convert Page to DB row
const toDbRow = (page: Partial<Page>) => ({
  title: page.title,
  slug: page.slug,
  heading_image: page.headingImage,
  body: page.body,
  excerpt: page.excerpt,
  images: page.images,
  is_featured: page.isFeatured,
  external_url: page.externalUrl,
  layout: page.layout,
  published: page.published,
});

export async function getPages(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
  
  return data.map(toPage);
}

export async function getFeaturedPages(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_featured', true)
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching featured pages:', error);
    return [];
  }
  
  return data.map(toPage);
}

export async function getNavPages(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_featured', false)
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching nav pages:', error);
    return [];
  }
  
  return data.map(toPage);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    console.error('Error fetching page by slug:', error);
    return null;
  }
  
  return toPage(data);
}

export async function addPage(page: Omit<Page, 'id' | 'createdAt'>): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .insert(toDbRow(page))
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error adding page:', error);
    return null;
  }
  
  return toPage(data);
}

export async function updatePage(id: string, updates: Partial<Page>): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .update({ ...toDbRow(updates), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error updating page:', error);
    return null;
  }
  
  return toPage(data);
}

export async function deletePage(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting page:', error);
    return false;
  }
  
  return true;
}

