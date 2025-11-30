"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPageBySlug } from "@/lib/pages";
import { Page } from "@/lib/types";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PageViewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const foundPage = getPageBySlug(slug);
    if (foundPage) {
      setPage(foundPage);
}
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Page not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Get layout-specific styles
  const getLayoutStyles = () => {
    switch (page.layout) {
      case "gallery":
        return "max-w-5xl";
      case "photo-journal":
        return "max-w-4xl";
      default:
        return "max-w-3xl";
  }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className={`mx-auto ${getLayoutStyles()}`}>
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <article className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Cover Image */}
            {page.headingImage && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img
                  src={page.headingImage}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time>
                  {new Date(page.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            <h1 className="mb-6 text-4xl font-semibold tracking-tight">
                {page.title}
            </h1>

              {/* Content */}
              <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {page.body}
              </ReactMarkdown>
              </div>

              {/* Photo Gallery */}
              {page.images && page.images.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Photos</h2>
                  <div className={`grid gap-4 ${
                    page.layout === "gallery" 
                      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                      : "grid-cols-1 md:grid-cols-2"
                  }`}>
                    {page.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${page.title} photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      {/* Lightbox for viewing images */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
