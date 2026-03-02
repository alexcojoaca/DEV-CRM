"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  agencyName: string;
  phone?: string;
  email?: string;
  address?: string;
  links?: FooterLink[];
  social?: { label: string; href: string; icon?: React.ReactNode }[];
  copyright?: string;
  className?: string;
}

export function Footer({
  agencyName,
  phone,
  email,
  address,
  links = [],
  social = [],
  copyright,
  className,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-site-border bg-site-muted/30 py-grid-12",
        className
      )}
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-grid-4 sm:px-grid-6 lg:px-grid-8">
        <div className="grid gap-grid-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-site-foreground">{agencyName}</p>
            {(phone || email || address) && (
              <ul className="mt-grid-4 space-y-grid-2 text-sm text-site-muted-foreground">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 transition-colors hover:text-site-foreground"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 transition-colors hover:text-site-foreground"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      {email}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            )}
          </div>

          {links.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-site-foreground">
                Linkuri
              </p>
              <ul className="mt-grid-4 space-y-grid-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-site-muted-foreground transition-colors hover:text-site-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {social.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-site-foreground">
                Social
              </p>
              <ul className="mt-grid-4 flex flex-wrap gap-grid-3">
                {social.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-site-muted-foreground transition-colors hover:text-site-foreground"
                      aria-label={item.label}
                    >
                      {item.icon ?? item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-grid-12 border-t border-site-border pt-grid-6 text-center text-sm text-site-muted-foreground">
          {copyright ?? `© ${year} ${agencyName}. Toate drepturile rezervate.`}
        </div>
      </div>
    </footer>
  );
}
