"use client";

import { motion } from "framer-motion";
import type { Property } from "@/features/properties/propertyTypes";
import { PropertyCard } from "./PropertyCard";
import { cn } from "@/lib/utils";

export interface FeaturedPropertiesProps {
  title: string;
  subtitle?: string;
  properties: Property[];
  className?: string;
}

export function FeaturedProperties({
  title,
  subtitle,
  properties,
  className,
}: FeaturedPropertiesProps) {
  return (
    <section
      className={cn("py-grid-12 sm:py-grid-16 md:py-grid-20", className)}
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-7xl px-grid-4 sm:px-grid-6 lg:px-grid-8">
        <motion.div
          className="mb-grid-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="featured-heading" className="text-3xl font-bold tracking-tight text-site-foreground sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-grid-3 max-w-2xl text-lg text-site-muted-foreground">
              {subtitle}
            </p>
          )}
        </motion.div>
        <div className="grid gap-grid-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 6).map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
