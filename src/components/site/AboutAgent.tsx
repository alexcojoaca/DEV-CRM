"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AboutAgentProps {
  name: string;
  role?: string;
  imageUrl?: string | null;
  bio: string;
  experience?: string;
  trustIndicators?: { label: string; value: string }[];
  className?: string;
}

export function AboutAgent({
  name,
  role,
  imageUrl,
  bio,
  experience,
  trustIndicators,
  className,
}: AboutAgentProps) {
  return (
    <section className={cn("py-grid-12 sm:py-grid-16 md:py-grid-20", className)} aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl px-grid-4 sm:px-grid-6 lg:px-grid-8">
        <div className="grid gap-grid-12 lg:grid-cols-2 lg:gap-grid-16 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aspect-[3/4] overflow-hidden rounded-site-radius shadow-site-lg">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-site-muted text-site-muted-foreground">
                  <span className="text-4xl font-light">{name.charAt(0)}</span>
                </div>
              )}
            </div>
          </motion.div>
          <div>
            <motion.h2 id="about-heading" className="text-3xl font-bold tracking-tight text-site-foreground sm:text-4xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              Despre mine
            </motion.h2>
            <motion.p className="mt-grid-2 text-xl font-medium text-site-primary" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
              {name}{role ? <span className="font-normal text-site-muted-foreground"> - {role}</span> : null}
            </motion.p>
            <motion.div className="mt-grid-6 space-y-grid-4 text-site-muted-foreground" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}>
              <p className="text-lg leading-relaxed">{bio}</p>
              {experience ? <p className="text-lg leading-relaxed">{experience}</p> : null}
            </motion.div>
            {trustIndicators && trustIndicators.length > 0 && (
              <motion.div className="mt-grid-8 grid gap-grid-4 sm:grid-cols-2" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 }}>
                {trustIndicators.map((item, i) => (
                  <div key={i} className="rounded-site-radius border border-site-border bg-site-card p-grid-4 shadow-site-sm">
                    <p className="text-2xl font-bold text-site-primary">{item.value}</p>
                    <p className="mt-1 text-sm text-site-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
