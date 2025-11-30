import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import { Calendar } from "lucide-react";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-4xl font-semibold tracking-tight">
            Blog
          </h1>
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-muted/50 md:p-8"
              >
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
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

