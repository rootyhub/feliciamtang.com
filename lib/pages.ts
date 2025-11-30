// Mock data store for pages - replace with Supabase later
import { Page } from "./types";

// Check if we're in browser
const isBrowser = typeof window !== "undefined";

// Initial pages data
const initialPages: Page[] = [
  // Featured pages (the 3 image pages)
  {
    id: "feat-1",
    title: "Career related stuff",
    headingImage: "/careerstuff.jpg",
    body: "Career related content and projects.",
    images: [],
    createdAt: new Date(),
    isFeatured: true,
  },
  {
    id: "feat-2",
    title: "Touched by Magic",
    headingImage: "/touchedbymagic.webp",
    body: "Friendship is magic - a blog post about meaningful connections.",
    images: [],
    createdAt: new Date(),
    isFeatured: true,
    externalUrl: "https://open.substack.com/pub/capitolcitizen/p/friendship-is-magic?r=2whac9&utm_campaign=post&utm_medium=web",
  },
  {
    id: "feat-3",
    title: "My kittens",
    headingImage: "/mykittens.jpg",
    body: "Photos and stories about my adorable kittens.",
    images: [],
    createdAt: new Date(),
    isFeatured: true,
  },
  // Regular navigation pages
  {
    id: "nav1",
    title: "LATEST FEATURED SITES",
    headingImage: "",
    body: "Content for latest featured sites",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav2",
    title: "FEATURED SITE ARCHIVES",
    headingImage: "",
    body: "Content for featured site archives",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav3",
    title: "RES72 FORUMS",
    headingImage: "",
    body: "Content for forums",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav4",
    title: "FLASH RESOURCES",
    headingImage: "",
    body: "Content for flash resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav5",
    title: "IMAGE RESOURCES",
    headingImage: "",
    body: "Content for image resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav6",
    title: "VECTOR RESOURCES",
    headingImage: "",
    body: "Content for vector resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav7",
    title: "FONT RESOURCES",
    headingImage: "",
    body: "Content for font resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav8",
    title: "LOGO RESOURCES",
    headingImage: "",
    body: "Content for logo resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav9",
    title: "SOUND RESOURCES",
    headingImage: "",
    body: "Content for sound resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav10",
    title: "PHOTOSHOP RESOURCES",
    headingImage: "",
    body: "Content for Photoshop resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav11",
    title: "VIDEO RESOURCES",
    headingImage: "",
    body: "Content for video resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav12",
    title: "CSS RESOURCES",
    headingImage: "",
    body: "Content for CSS resources",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav13",
    title: "DESIGN LINKS",
    headingImage: "",
    body: "Content for design links",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav14",
    title: "CODE LINKS",
    headingImage: "",
    body: "Content for code links",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
  {
    id: "nav15",
    title: "NEWS LINKS",
    headingImage: "",
    body: "Content for news links",
    images: [],
    createdAt: new Date(),
    isFeatured: false,
  },
];

// Version for pages data - increment to force refresh
const PAGES_VERSION = 4;

// Load pages from localStorage or use initial data
const loadPagesFromStorage = (): Page[] => {
  if (isBrowser) {
    const storedVersion = localStorage.getItem("pages_version");
    
    // If version mismatch or no version, reset to initial data
    if (storedVersion !== String(PAGES_VERSION)) {
      console.log("Pages version mismatch, resetting to initial data");
      localStorage.setItem("pages_version", String(PAGES_VERSION));
      localStorage.setItem("pages", JSON.stringify(initialPages));
      return [...initialPages];
    }
    
    const stored = localStorage.getItem("pages");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
      } catch (e) {
        console.error("Failed to parse pages from localStorage", e);
        // Reset on parse error
        localStorage.setItem("pages", JSON.stringify(initialPages));
        return [...initialPages];
      }
    }
  }
  return [...initialPages];
};

// Save pages to localStorage
const savePagesToStorage = (pagesToSave: Page[]) => {
  if (isBrowser) {
    localStorage.setItem("pages", JSON.stringify(pagesToSave));
  }
};

let pages: Page[] = loadPagesFromStorage();

export const getPages = (): Page[] => {
  return pages;
};

export const getFeaturedPages = (): Page[] => {
  return pages.filter((p) => p.isFeatured);
};

export const getNavPages = (): Page[] => {
  return pages.filter((p) => !p.isFeatured);
};

export const addPage = (page: Omit<Page, "id" | "createdAt">): Page => {
  const newPage: Page = {
    id: Date.now().toString(),
    ...page,
    createdAt: new Date(),
  };
  pages.push(newPage);
  savePagesToStorage(pages);
  return newPage;
};

export const updatePage = (id: string, updates: Partial<Omit<Page, "id" | "createdAt">>): Page | null => {
  const index = pages.findIndex((p) => p.id === id);
  if (index === -1) return null;
  pages[index] = { ...pages[index], ...updates };
  savePagesToStorage(pages);
  return pages[index];
};

export const deletePage = (id: string): boolean => {
  const index = pages.findIndex((p) => p.id === id);
  if (index === -1) return false;
  pages.splice(index, 1);
  savePagesToStorage(pages);
  return true;
};

// Force refresh pages from storage (useful after external changes)
export const refreshPages = (): Page[] => {
  pages = loadPagesFromStorage();
  return pages;
};
