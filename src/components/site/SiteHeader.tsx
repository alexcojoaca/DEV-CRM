"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitch } from "./ThemeSwitch";

export interface SiteHeaderProps {
  agencyName: string;
  logoUrl?: string | null;
  phone?: string;
  navLinks?: { label: string; href: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const DEFAULT_LINKS = [
  { label: "Proprietati", href: "#proprietati" },
  { label: "Despre", href: "#despre" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader({
  agencyName,
  logoUrl,
  phone,
  navLinks = DEFAULT_LINKS,
  ctaLabel = "Sună",
  ctaHref,
  className,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const href = ctaHref ?? (phone ? `tel:${phone.replace(/\s/g, "")}` : "#contact");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-site-border bg-site-background/95 backdrop-blur-md shadow-site-sm",
        className
      )}
      role="banner"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-grid-4 px-grid-4 py-grid-3 sm:px-grid-6">
        <Link href="/p" className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={agencyName} className="h-9 max-w-[160px] object-contain" />
          ) : (
            <span className="text-xl font-semibold text-site-foreground">{agencyName}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-grid-6 md:flex" aria-label="Principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-site-muted-foreground transition-colors hover:text-site-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-grid-3">
          {phone && (
            <a
              href={href}
              className="hidden items-center gap-2 rounded-full bg-site-primary px-grid-5 py-2.5 text-sm font-semibold text-site-primary-foreground shadow-site-sm transition-all hover:opacity-95 sm:inline-flex"
            >
              <Phone className="h-4 w-4" />
              {ctaLabel}
            </a>
          )}
          <ThemeSwitch />
          <button
            type="button"
            className="rounded-lg p-2 text-site-foreground hover:bg-site-muted md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-site-border bg-site-card md:hidden"
          >
            <nav className="flex flex-col gap-1 px-grid-4 py-grid-4" aria-label="Mobil">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg py-3 text-site-foreground hover:bg-site-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {phone && (
                <a href={href} className="mt-2 rounded-lg py-3 font-semibold text-site-primary">
                  {ctaLabel}
                </a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
