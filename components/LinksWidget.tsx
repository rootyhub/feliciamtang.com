"use client";

import { motion } from "framer-motion";
import { ExternalLink, Mail, Twitter } from "lucide-react";

const links = [
  {
    name: "Substack",
    url: "https://substack.com",
    icon: ExternalLink,
  },
  {
    name: "Twitter/X",
    url: "https://twitter.com",
    icon: Twitter,
  },
  {
    name: "Email",
    url: "mailto:your.email@example.com",
    icon: Mail,
  },
];

export default function LinksWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <h2 className="mb-6 text-xl font-semibold tracking-tight">Connect</h2>
      <div className="space-y-3">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4 transition-all hover:border-primary/50 hover:bg-muted"
            >
              <span className="font-medium">{link.name}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

