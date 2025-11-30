import { supabase, isSupabaseConfigured } from '../supabase';
import { Page } from '../types';
import * as localPages from '../pages';

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
  if (!isSupabaseConfigured) {
    return localPages.getPages();
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pages:', error);
    return localPages.getPages();
  }
  
  return data.map(toPage);
}

export async function getFeaturedPages(): Promise<Page[]> {
  if (!isSupabaseConfigured) {
    return localPages.getFeaturedPages();
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_featured', true)
    .eq('published', true)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching featured pages:', error);
    return localPages.getFeaturedPages();
  }
  
  return data.map(toPage);
}

export async function getNavPages(): Promise<Page[]> {
  if (!isSupabaseConfigured) {
    return localPages.getNavPages();
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_featured', false)
    .eq('published', true)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching nav pages:', error);
    return localPages.getNavPages();
  }
  
  return data.map(toPage);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  if (!isSupabaseConfigured) {
    return localPages.getPageBySlug(slug);
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    console.error('Error fetching page by slug:', error);
    return localPages.getPageBySlug(slug);
  }
  
  return toPage(data);
}

export async function addPage(page: Omit<Page, 'id' | 'createdAt'>): Promise<Page | null> {
  if (!isSupabaseConfigured) {
    return localPages.addPage(page);
  }

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
  if (!isSupabaseConfigured) {
    return localPages.updatePage(id, updates);
  }

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
  if (!isSupabaseConfigured) {
    localPages.deletePage(id);
    return true;
  }

  console.log('Attempting to delete page with id:', id);
  
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
    .select();
  
  console.log('Delete result - data:', data, 'error:', error);
  
  if (error) {
    console.error('Error deleting page:', error);
    return false;
  }
  
  return true;
}

export async function movePageUp(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  // Get all featured pages ordered by order_index
  const { data: pages } = await supabase
    .from('pages')
    .select('id, order_index, is_featured')
    .order('order_index', { ascending: true });

  if (!pages) return;

  const index = pages.findIndex(p => p.id === id);
  if (index <= 0) return;

  // Find the previous page with the same is_featured status
  const currentPage = pages[index];
  let prevIndex = index - 1;
  while (prevIndex >= 0 && pages[prevIndex].is_featured !== currentPage.is_featured) {
    prevIndex--;
  }
  if (prevIndex < 0) return;

  const prevPage = pages[prevIndex];

  // Swap order indices
  await supabase
    .from('pages')
    .update({ order_index: prevPage.order_index })
    .eq('id', currentPage.id);

  await supabase
    .from('pages')
    .update({ order_index: currentPage.order_index })
    .eq('id', prevPage.id);
}

export async function movePageDown(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  // Get all pages ordered by order_index
  const { data: pages } = await supabase
    .from('pages')
    .select('id, order_index, is_featured')
    .order('order_index', { ascending: true });

  if (!pages) return;

  const index = pages.findIndex(p => p.id === id);
  if (index < 0 || index >= pages.length - 1) return;

  // Find the next page with the same is_featured status
  const currentPage = pages[index];
  let nextIndex = index + 1;
  while (nextIndex < pages.length && pages[nextIndex].is_featured !== currentPage.is_featured) {
    nextIndex++;
  }
  if (nextIndex >= pages.length) return;

  const nextPage = pages[nextIndex];

  // Swap order indices
  await supabase
    .from('pages')
    .update({ order_index: nextPage.order_index })
    .eq('id', currentPage.id);

  await supabase
    .from('pages')
    .update({ order_index: currentPage.order_index })
    .eq('id', nextPage.id);
}

