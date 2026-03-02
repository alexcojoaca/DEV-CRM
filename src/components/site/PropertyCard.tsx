"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bed, Bath, Ruler, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/features/properties/propertyTypes";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartament",
  house: "Casă",
  land: "Teren",
  commercial: "Comercial",
};

export interface PropertyCardProps {
  property: Property;
  index?: number;
  className?: string;
}

export function PropertyCard({ property, index = 0, className }: PropertyCardProps) {
  const imageUrl = property.images?.[0]?.data;
  const address = [property.street, property.number, property.city ?? property.county]
    .filter(Boolean)
    .join(", ");
  const statusLabel = property.transactionType === "rent" ? "De închiriat" : "De vânzare";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.32), ease: [0.22, 1, 0.36, 1] }}
      className={cn("group", className)}
    >
      <Link href={`/p/property/${property.id}`} className="block overflow-hidden rounded-site-radius bg-site-card shadow-site transition-all duration-300 hover:shadow-site-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-site-muted text-site-muted-foreground">
              <Ruler className="h-16 w-16 opacity-40" />
            </div>
          )}
          <div className="absolute left-grid-3 top-grid-3">
            <span className="rounded-lg bg-site-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-site-primary-foreground shadow-site-sm">
              {statusLabel}
            </span>
          </div>
          <div className="absolute bottom-grid-3 right-grid-3 rounded-lg bg-site-card/95 px-3 py-2 shadow-site backdrop-blur-sm">
            <span className="text-lg font-bold text-site-foreground">
              {Number(property.price).toLocaleString("ro-RO")} EUR
              {property.transactionType === "rent" && (
                <span className="text-sm font-normal text-site-muted-foreground">/lună</span>
              )}
            </span>
          </div>
        </div>
        <div className="p-grid-5">
          <h3 className="text-xl font-semibold text-site-foreground line-clamp-1 group-hover:text-site-primary">
            {property.title}
          </h3>
          {address && (
            <p className="mt-grid-1 flex items-center gap-1.5 text-sm text-site-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-site-accent" />
              <span className="line-clamp-1">{address}</span>
            </p>
          )}
          <div className="mt-grid-4 flex flex-wrap gap-grid-4 text-sm text-site-muted-foreground">
            {property.usefulArea != null && (
              <span className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-site-accent" />
                {property.usefulArea} mp
              </span>
            )}
            {property.rooms != null && (
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-site-accent" />
                {property.rooms} camere
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-site-accent" />
                {property.bathrooms} băi
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
