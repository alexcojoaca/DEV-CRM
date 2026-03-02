"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bed,
  Bath,
  Ruler,
  MapPin,
  Phone,
  ArrowLeft,
  Send,
} from "lucide-react";
import { getSiteConfig } from "@/features/site/siteConfig";
import type { Property } from "@/features/properties/propertyTypes";
import { SiteHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addLeadSubmission } from "@/features/leads/leadMockData";
import { cn } from "@/lib/utils";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartament",
  house: "Casă",
  land: "Teren",
  commercial: "Comercial",
};

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [config, setConfig] = useState(getSiteConfig());
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);

  const property = config.properties.find((p: Property) => p.id === id) as Property | undefined;
  const images = property?.images?.length ? property.images : [];
  const address = property
    ? [property.street, property.number, property.city ?? property.county].filter(Boolean).join(", ")
    : "";

  if (!property) {
    return (
      <div className="min-h-screen bg-site-background flex items-center justify-center px-grid-4">
        <div className="text-center">
          <p className="text-site-muted-foreground">Proprietatea nu a fost găsită.</p>
          <Link href="/p" className="mt-grid-4 inline-flex items-center gap-2 text-site-primary font-medium">
            <ArrowLeft className="h-4 w-4" /> Înapoi la oferte
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || (!formData.phone.trim() && !formData.email.trim())) return;
    addLeadSubmission({
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      source: "other",
      status: "new",
      agentId: property.agentId,
      notes: `Detalii proprietate: ${property.title}. ${formData.message || ""}`,
    });
    setFormSent(true);
  };

  return (
    <div className="min-h-screen bg-site-background text-site-foreground">
      <SiteHeader
        agencyName={config.agencyName || "Agenția Mea"}
        logoUrl={config.logoDataUrl}
        phone={config.agencyPhone}
        navLinks={[
          { label: "Proprietăți", href: "/p#proprietati" },
          { label: "Despre", href: "/p#despre" },
          { label: "Contact", href: "/p#contact" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-grid-4 py-grid-6 sm:px-grid-6 lg:px-grid-8">
        <Link
          href="/p#proprietati"
          className="mb-grid-6 inline-flex items-center gap-2 text-sm font-medium text-site-muted-foreground transition-colors hover:text-site-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Înapoi la oferte
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-grid-4 sm:px-grid-6 lg:px-grid-8">
        <div className="grid gap-grid-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-grid-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-site-radius bg-site-card shadow-site-lg"
            >
              <div className="relative aspect-[16/10] bg-site-muted">
                {images[imageIndex]?.data ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[imageIndex].data}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-site-muted-foreground">
                    <Ruler className="h-20 w-20 opacity-40" />
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-grid-3 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIndex(i)}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          i === imageIndex ? "w-8 bg-site-primary" : "w-2 bg-white/60 hover:bg-white/80"
                        )}
                        aria-label={`Imagine ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-site-foreground sm:text-4xl">
                {property.title}
              </h1>
              {address && (
                <p className="mt-grid-2 flex items-center gap-2 text-site-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0 text-site-accent" />
                  {address}
                </p>
              )}

              <div className="mt-grid-6 flex flex-wrap gap-grid-6 text-site-muted-foreground">
                {property.usefulArea != null && (
                  <span className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-site-accent" />
                    {property.usefulArea} mp
                  </span>
                )}
                {property.rooms != null && (
                  <span className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-site-accent" />
                    {property.rooms} camere
                  </span>
                )}
                {property.bathrooms != null && (
                  <span className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-site-accent" />
                    {property.bathrooms} băi
                  </span>
                )}
              </div>

              {property.description && (
                <div className="mt-grid-8">
                  <h2 className="text-xl font-semibold text-site-foreground">Descriere</h2>
                  <p className="mt-grid-3 whitespace-pre-wrap text-site-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}
            </motion.section>
          </div>

          <div className="lg:col-span-1">
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="sticky top-24 space-y-grid-6"
            >
              <div className="rounded-site-radius border border-site-border bg-site-card p-grid-6 shadow-site">
                <p className="text-2xl font-bold text-site-primary">
                  {Number(property.price).toLocaleString("ro-RO")} EUR
                  {property.transactionType === "rent" && (
                    <span className="text-base font-normal text-site-muted-foreground"> / lună</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-site-muted-foreground">
                  {PROPERTY_TYPE_LABELS[property.type] ?? property.type} · {property.transactionType === "rent" ? "De închiriat" : "De vânzare"}
                </p>
                {config.agencyPhone && (
                  <a
                    href={`tel:${config.agencyPhone.replace(/\s/g, "")}`}
                    className="mt-grid-4 flex w-full items-center justify-center gap-2 rounded-xl bg-site-primary py-3.5 font-semibold text-site-primary-foreground shadow-site-sm transition-all hover:opacity-95"
                  >
                    <Phone className="h-5 w-5" /> Sună
                  </a>
                )}
              </div>

              <div className="rounded-site-radius border border-site-border bg-site-card p-grid-6 shadow-site">
                <h3 className="font-semibold text-site-foreground">Solicită informații</h3>
                {formSent ? (
                  <p className="mt-grid-4 text-site-muted-foreground">Mulțumim! Te contactăm în curând.</p>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-grid-4 space-y-grid-4">
                    <div>
                      <Label htmlFor="pd-name" className="text-site-foreground">Nume *</Label>
                      <Input
                        id="pd-name"
                        value={formData.name}
                        onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                        required
                        className="mt-1 border-site-border bg-site-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pd-phone" className="text-site-foreground">Telefon</Label>
                      <Input
                        id="pd-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))}
                        className="mt-1 border-site-border bg-site-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pd-email" className="text-site-foreground">Email</Label>
                      <Input
                        id="pd-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                        className="mt-1 border-site-border bg-site-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pd-message" className="text-site-foreground">Mesaj</Label>
                      <Textarea
                        id="pd-message"
                        value={formData.message}
                        onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))}
                        rows={3}
                        className="mt-1 border-site-border bg-site-background"
                      />
                    </div>
                    <p className="text-xs text-site-muted-foreground">Completează telefonul sau emailul (cel puțin unul).</p>
                    <Button type="submit" className="w-full bg-site-primary text-site-primary-foreground hover:opacity-95">
                      <Send className="mr-2 h-4 w-4" /> Trimite
                    </Button>
                  </form>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </div>
  );
}
