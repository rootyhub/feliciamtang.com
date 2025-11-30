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

export async function movePageUp(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  // Get the current page to know if it's featured
  const { data: currentPageData } = await supabase
    .from('pages')
    .select('id, order_index, is_featured')
    .eq('id', id)
    .single();

  if (!currentPageData) return false;

  // Get all pages with the same is_featured status, ordered by order_index
  const { data: pages } = await supabase
    .from('pages')
    .select('id, order_index, is_featured')
    .eq('is_featured', currentPageData.is_featured)
    .order('order_index', { ascending: true, nullsFirst: false });

  if (!pages || pages.length < 2) return false;

  const index = pages.findIndex(p => p.id === id);
  if (index <= 0) return false;

  const currentPage = pages[index];
  const prevPage = pages[index - 1];

  // Use unique temporary values to avoid conflicts
  const tempIndex = -999;
  const currentOrder = currentPage.order_index ?? index;
  const prevOrder = prevPage.order_index ?? (index - 1);

  // Swap order indices using a temp value
  await supabase.from('pages').update({ order_index: tempIndex }).eq('id', currentPage.id);
  await supabase.from('pages').update({ order_index: currentOrder }).eq('id', prevPage.id);
  await supabase.from('pages').update({ order_index: prevOrder }).eq('id', currentPage.id);

  return true;
}

export async function movePageDown(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  // Get the current page to know if it's featured
  const { data: currentPageData } = await supabase
    .from('pages')
    .select('id, order_index, is_featured')
    .eq('id', id)
    .single();

  if (!currentPageData) return false;

  // Get all pages with the same is_featured status, ordered by order_index
  const { data: pages } = await supabase
    .from('pages')
    .select('id, order_index, is_featured')
    .eq('is_featured', currentPageData.is_featured)
    .order('order_index', { ascending: true, nullsFirst: false });

  if (!pages || pages.length < 2) return false;

  const index = pages.findIndex(p => p.id === id);
  if (index < 0 || index >= pages.length - 1) return false;

  const currentPage = pages[index];
  const nextPage = pages[index + 1];

  // Use unique temporary values to avoid conflicts
  const tempIndex = -999;
  const currentOrder = currentPage.order_index ?? index;
  const nextOrder = nextPage.order_index ?? (index + 1);

  // Swap order indices using a temp value
  await supabase.from('pages').update({ order_index: tempIndex }).eq('id', currentPage.id);
  await supabase.from('pages').update({ order_index: currentOrder }).eq('id', nextPage.id);
  await supabase.from('pages').update({ order_index: nextOrder }).eq('id', currentPage.id);

  return true;
}

export async function togglePageVisibility(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  // Get current published status
  const { data: page } = await supabase
    .from('pages')
    .select('published')
    .eq('id', id)
    .single();

  if (!page) return false;

  // Toggle it
  const { error } = await supabase
    .from('pages')
    .update({ published: !page.published })
    .eq('id', id);

  if (error) {
    console.error('Error toggling page visibility:', error);
    return false;
  }

  return true;
}

