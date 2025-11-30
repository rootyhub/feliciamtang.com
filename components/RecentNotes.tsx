"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/lib/mdx";

interface RecentNotesProps {
  posts: BlogPost[];
}

export default function RecentNotes({ posts }: RecentNotesProps) {
  const recentPosts = posts.slice(0, 3);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Recent Notes</h2>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {recentPosts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border border-border bg-muted/50 p-4 transition-all hover:border-primary/50 hover:bg-muted"
            >
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time>{new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</time>
              </div>
              <h3 className="mb-2 font-semibold transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                Read more
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

