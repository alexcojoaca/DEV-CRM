"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HeroProps {
  headline: string;
  subheadline: string;
  backgroundImage?: string | null;
  searchPlaceholder?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  onSearchSubmit?: (query: string) => void;
  showScrollIndicator?: boolean;
  className?: string;
}

export function Hero({
  headline,
  subheadline,
  backgroundImage,
  searchPlaceholder = "Locație, zonă sau oraș",
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  showScrollIndicator = true,
  className,
}: HeroProps) {
  return (
    <section
      className={cn("relative flex min-h-screen flex-col justify-end overflow-hidden", className)}
      aria-label="Hero"
    >
      <div className="absolute inset-0">
        {backgroundImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-site-muted" />
        )}
        <div
          className="absolute inset-0 bg-site-hero-overlay"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-grid-4 pb-grid-12 pt-grid-20 sm:px-grid-6 md:px-grid-8 lg:px-grid-12">
        <div className="mx-auto w-full max-w-4xl">
          <motion.h1
            className="max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {headline}
          </motion.h1>
          <motion.p
            className="mt-grid-4 max-w-2xl text-lg text-white/90 sm:text-xl md:text-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {subheadline}
          </motion.p>

          <motion.div
            className="mt-grid-8 max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-grid-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-grid-4 top-1/2 h-5 w-5 -translate-y-1/2 text-site-muted-foreground" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="h-14 w-full rounded-xl border-0 bg-white/95 pl-12 pr-4 text-site-foreground shadow-site-lg placeholder:text-site-muted-foreground focus:ring-2 focus:ring-site-primary focus:ring-offset-2"
                  aria-label="Caută proprietăți"
                />
              </div>
              <Link
                href={primaryCtaHref}
                className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-site-primary px-grid-6 font-semibold text-site-primary-foreground shadow-site-md transition-all hover:opacity-95 focus:ring-2 focus:ring-site-ring focus:ring-offset-2"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="mt-grid-6 flex flex-wrap gap-grid-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center gap-2 rounded-full bg-site-primary px-grid-6 py-3.5 font-semibold text-site-primary-foreground shadow-site transition-all hover:opacity-95"
            >
              {primaryCtaLabel}
            </Link>
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 px-grid-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {showScrollIndicator && (
        <motion.div
          className="absolute bottom-grid-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-hidden
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-white/80"
          >
            <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
