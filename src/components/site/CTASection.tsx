"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CTASectionProps {
  headline: string;
  subheadline?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: "default" | "dark";
  className?: string;
}

export function CTASection({
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant = "dark",
  className,
}: CTASectionProps) {
  const isDark = variant === "dark";
  return (
    <section
      className={cn(
        "py-grid-16 sm:py-grid-20 md:py-grid-24",
        isDark ? "bg-site-primary text-site-primary-foreground" : "bg-site-muted/50",
        className
      )}
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-4xl px-grid-4 text-center sm:px-grid-6">
        <motion.h2
          id="cta-heading"
          className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {headline}
        </motion.h2>
        {subheadline && (
          <motion.p
            className={cn("mx-auto mt-grid-4 max-w-2xl text-lg", isDark ? "text-white/90" : "text-site-muted-foreground")}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {subheadline}
          </motion.p>
        )}
        <motion.div
          className="mt-grid-8 flex flex-wrap items-center justify-center gap-grid-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href={primaryHref}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-grid-8 py-4 font-semibold shadow-site-md transition-all hover:opacity-95 focus:ring-2 focus:ring-offset-2",
              isDark ? "bg-site-accent text-site-accent-foreground focus:ring-site-accent" : "bg-site-primary text-site-primary-foreground focus:ring-site-ring"
            )}
          >
            {primaryLabel}
            <ArrowRight className="h-5 w-5" />
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-grid-8 py-4 font-semibold transition-all hover:opacity-90 focus:ring-2 focus:ring-offset-2",
                isDark ? "border-white/60 text-white focus:ring-white/40" : "border-site-primary text-site-primary focus:ring-site-ring"
              )}
            >
              {secondaryLabel}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
