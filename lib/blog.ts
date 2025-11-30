// Blog post management with localStorage persistence
import { BlogPost } from "./types";

const isBrowser = typeof window !== "undefined";

// Initial blog posts (migrated from MDX files)
const initialPosts: BlogPost[] = [
  {
    id: "1",
    slug: "my-kittens",
    title: "My Kittens",
    content: "Welcome to my kitten photo gallery! 🐱\n\nThese are my adorable fur babies. They bring so much joy to my life every day.",
    excerpt: "Meet my adorable fur babies!",
    coverImage: "/mykittens.jpg",
    images: [],
    date: new Date().toISOString(),
    published: true,
    layout: "gallery",
  },
  {
    id: "2",
    slug: "hello-world",
    title: "Hello World",
    content: "Welcome to my digital garden! This is where I share my thoughts, projects, and journey.\n\nI'm excited to start this new chapter and document my experiences along the way.",
    excerpt: "Welcome to my digital garden!",
    images: [],
    date: "2024-01-15",
    published: true,
    layout: "default",
  },
  {
    id: "3",
    slug: "building-in-public",
    title: "Building in Public",
    content: "I've decided to build in public. This means sharing my progress, failures, and learnings as I work on various projects.\n\nBuilding in public has many benefits:\n- Accountability\n- Community feedback\n- Networking opportunities\n- Documentation of the journey",
    excerpt: "Why I decided to share my journey openly",
    images: [],
    date: "2024-01-10",
    published: true,
    layout: "default",
  },
];

// Load posts from localStorage or use initial data
const loadPostsFromStorage = (): BlogPost[] => {
  if (isBrowser) {
    const stored = localStorage.getItem("blogPosts");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse blog posts from localStorage", e);
      }
    }
  }
  return [...initialPosts];
};

// Save posts to localStorage
const savePostsToStorage = (postsToSave: BlogPost[]) => {
  if (isBrowser) {
    localStorage.setItem("blogPosts", JSON.stringify(postsToSave));
  }
};

let posts: BlogPost[] = loadPostsFromStorage();

export const getBlogPosts = (): BlogPost[] => {
  // Reload from storage in case of updates
  if (isBrowser) {
    posts = loadPostsFromStorage();
  }
  return posts.filter(p => p.published).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getAllBlogPosts = (): BlogPost[] => {
  if (isBrowser) {
    posts = loadPostsFromStorage();
  }
  return posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getBlogPostBySlug = (slug: string): BlogPost | null => {
  if (isBrowser) {
    posts = loadPostsFromStorage();
  }
  return posts.find(p => p.slug === slug) || null;
};

export const addBlogPost = (post: Omit<BlogPost, "id">): BlogPost => {
  const newPost: BlogPost = {
    id: Date.now().toString(),
    ...post,
  };
  posts.push(newPost);
  savePostsToStorage(posts);
  return newPost;
};

export const updateBlogPost = (id: string, updates: Partial<Omit<BlogPost, "id">>): BlogPost | null => {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;
  posts[index] = { ...posts[index], ...updates };
  savePostsToStorage(posts);
  return posts[index];
};

export const deleteBlogPost = (id: string): boolean => {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return false;
  posts.splice(index, 1);
  savePostsToStorage(posts);
  return true;
};

// Add image to a blog post
export const addImageToBlogPost = (id: string, imageUrl: string): BlogPost | null => {
  const post = posts.find(p => p.id === id);
  if (!post) return null;
  post.images = [...(post.images || []), imageUrl];
  savePostsToStorage(posts);
  return post;
};

// Remove image from a blog post
export const removeImageFromBlogPost = (id: string, imageIndex: number): BlogPost | null => {
  const post = posts.find(p => p.id === id);
  if (!post) return null;
  post.images = post.images.filter((_, i) => i !== imageIndex);
  savePostsToStorage(posts);
  return post;
};

// Refresh posts from storage
export const refreshBlogPosts = (): BlogPost[] => {
  posts = loadPostsFromStorage();
  return posts;
};

