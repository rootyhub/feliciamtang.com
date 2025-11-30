"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";
import { BlogPost } from "@/lib/types";
import { Calendar, ArrowLeft } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setPosts(getBlogPosts());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <h1 className="mb-8 text-4xl font-semibold tracking-tight">
            Blog
          </h1>
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p className="text-muted-foreground">No blog posts yet.</p>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:bg-muted/50"
                >
                  {post.coverImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <time>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
