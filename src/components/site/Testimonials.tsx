"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsProps {
  title?: string;
  items: TestimonialItem[];
  className?: string;
}

export function Testimonials(props: TestimonialsProps) {
  const { title = "Ce spun clienții", items, className } = props;
  if (!items.length) return null;
  return (
    <section className={cn("py-grid-12 sm:py-grid-16 md:py-grid-20 bg-site-muted/50", className)} aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-5xl px-grid-4 sm:px-grid-6 lg:px-grid-8">
        <motion.h2
          id="testimonials-heading"
          className="text-center text-3xl font-bold tracking-tight text-site-foreground sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
        <div className="mt-grid-12 grid gap-grid-8 md:grid-cols-2">
          {items.map((item, i) => (
            <motion.blockquote
              key={i}
              className="rounded-site-radius border border-site-border bg-site-card p-grid-6 shadow-site-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-lg italic leading-relaxed text-site-foreground">
                &quot;{item.quote}&quot;
              </p>
              <footer className="mt-grid-4">
                <p className="font-semibold text-site-foreground">{item.author}</p>
                {item.role ? <p className="text-sm text-site-muted-foreground">{item.role}</p> : null}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
