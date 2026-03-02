"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  MapPin,
  Ruler,
  Bed,
  Bath,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PropertyMapView = dynamic(
  () => import("@/components/properties/PropertyMapView").then((m) => m.PropertyMapView),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-2xl bg-neutral-800 animate-pulse flex items-center justify-center text-neutral-500">Se încarcă harta…</div> }
);

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartament",
  house: "Casă",
  land: "Teren",
  commercial: "Comercial",
};

const BUILDING_TYPE_LABELS: Record<string, string> = {
  apartment: "Bloc",
  house: "Casă/Vilă",
  villa: "Vilă",
  duplex: "Duplex",
  penthouse: "Penthouse",
  studio: "Studio",
  other: "Altul",
};

const LAND_CATEGORY_LABELS: Record<string, string> = {
  intravilan: "Intravilan",
  extravilan: "Extravilan",
  agricultural: "Agricol",
  forest: "Forestier",
};

const COMMERCIAL_CATEGORY_LABELS: Record<string, string> = {
  office: "Birou",
  retail: "Retail",
  restaurant: "Restaurant",
  warehouse: "Depozit",
  other: "Altul",
};

function floorLabel(floor: number | undefined): string {
  if (floor == null) return "—";
  if (floor === -1) return "Demisol";
  if (floor === 0) return "Parter";
  if (floor === 98) return "Ultimele 2 etaje";
  if (floor === 99) return "Mansardă";
  return `Etaj ${floor}`;
}

interface PresentationData {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  transactionType?: string;
  street?: string;
  number?: string;
  zone?: string;
  county?: string;
  city?: string;
  price?: number;
  priceCurrency?: string;
  usefulArea?: number;
  yardArea?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  buildingType?: string;
  landCategory?: string;
  landClassification?: string;
  commercialCategory?: string;
  constructionYear?: number;
  compartmentType?: string;
  comfort?: string;
  hasBasement?: boolean;
  hasSemiBasement?: boolean;
  hasAttic?: boolean;
  streetFrontage?: number;
  mapLocation?: string;
  plusVAT?: boolean;
  negotiable?: boolean;
  images?: Array<{ data: string; name?: string }>;
  [key: string]: unknown;
}

export default function PrezentarePage() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      setError("Link invalid");
      setLoading(false);
      return;
    }
    fetch(`/api/prezentare/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Link expirat sau invalid");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Link expirat sau invalid"))
      .finally(() => setLoading(false));
  }, [token]);

  const images = data?.images?.length ? data.images : [];
  const address = data
    ? [data.street, data.number, data.zone, data.county].filter(Boolean).join(", ") || data.city || "—"
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="h-12 w-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Se încarcă prezentarea…</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <p className="text-xl text-neutral-300 mb-2">Link invalid sau expirat</p>
          <p className="text-neutral-500 text-sm">Acest link de prezentare nu mai este disponibil.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden relative">
      {/* Animație de fundal discretă – glow violet/fuchsia foarte subtil */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.6),transparent_50%)] animate-[prezentare-glow_20s_ease-in-out_infinite]"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_85%_45%,rgba(236,72,153,0.4),transparent_50%)] animate-[prezentare-glow_25s_ease-in-out_infinite_reverse]"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_15%_75%,rgba(139,92,246,0.35),transparent_50%)] animate-[prezentare-glow_18s_ease-in-out_infinite]"
        />
      </div>

      {/* Galerie: PC = săgeți stânga/dreapta, telefon = scroll în carduri */}
      <section className="relative z-10 pt-6 sm:pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        {images.length > 0 ? (
          <>
            {/* Desktop: carusel cu săgeți */}
            <div className="hidden sm:block max-w-5xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  key={imageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={typeof images[imageIndex] === "object" && images[imageIndex]?.data ? images[imageIndex].data : ""}
                  alt={data.title || `Imagine ${imageIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="h-7 w-7" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      aria-label="Următor"
                    >
                      <ChevronRight className="h-7 w-7" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/50 text-sm text-white/90">
                      {imageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobil: scroll orizontal, poze în carduri */}
            <div className="sm:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 flex gap-4" ref={scrollRef}>
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="shrink-0 w-[85vw] max-w-sm snap-center"
                >
                  <div className="rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl">
                    <div className="aspect-[4/3] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={typeof img === "object" && img?.data ? img.data : ""}
                        alt={data.title || `Imagine ${i + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="px-3 py-2 text-center text-neutral-400 text-sm">
                      {i + 1} / {images.length}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-neutral-900/50 rounded-2xl border border-white/5">
            <Home className="h-24 w-24 text-neutral-600 mb-4 opacity-50" />
            <p className="text-neutral-500 text-sm">Fără imagini</p>
          </div>
        )}
      </section>

      {/* Titlu + preț – card compact, elegant */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 px-4 sm:px-6 lg:px-8 pt-6 pb-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-white/[0.06] shadow-xl px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-violet-400/90 text-xs font-medium uppercase tracking-[0.2em] mb-1.5">
              {PROPERTY_TYPE_LABELS[data.type || ""] ?? data.type} · {data.transactionType === "rent" ? "Închiriere" : "Vânzare"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight mb-2">
              {data.title}
            </h1>
            {address && (
              <p className="flex items-center gap-1.5 text-neutral-500 text-sm mb-4">
                <MapPin className="h-4 w-4 text-violet-400/70 shrink-0" />
                {address}
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {Number(data.price ?? 0).toLocaleString("ro-RO")} {data.priceCurrency || "EUR"}
              </span>
              {data.transactionType === "rent" && (
                <span className="text-sm text-neutral-500">/ lună</span>
              )}
              {(data.plusVAT || data.negotiable) && (
                <div className="flex flex-wrap gap-1.5">
                  {data.plusVAT && (
                    <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-2.5 py-0.5 text-xs text-violet-300/90">Plus TVA</span>
                  )}
                  {data.negotiable && (
                    <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-2.5 py-0.5 text-xs text-violet-300/90">Negociabil</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Caracteristici */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Caracteristici</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(data.usefulArea != null || data.type === "land") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl bg-neutral-800/80 border border-white/5 p-5 text-center"
              >
                <Ruler className="h-7 w-7 text-violet-400 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm">
                  {data.type === "land" ? "Suprafață teren" : "Suprafață utilă"}
                </p>
                <p className="text-xl font-bold text-white">
                  {(data.type === "land" ? data.yardArea : data.usefulArea) ?? data.usefulArea ?? 0} mp
                </p>
              </motion.div>
            )}
            {(data.type === "apartment" || data.type === "house") && (data.rooms != null || data.bedrooms != null) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="rounded-2xl bg-neutral-800/80 border border-white/5 p-5 text-center"
              >
                <Bed className="h-7 w-7 text-violet-400 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm">Camere</p>
                <p className="text-xl font-bold text-white">{data.rooms ?? data.bedrooms ?? "—"}</p>
              </motion.div>
            )}
            {(data.type === "apartment" || data.type === "house") && data.bathrooms != null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl bg-neutral-800/80 border border-white/5 p-5 text-center"
              >
                <Bath className="h-7 w-7 text-violet-400 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm">Băi</p>
                <p className="text-xl font-bold text-white">{data.bathrooms}</p>
              </motion.div>
            )}
            {data.type === "house" && data.yardArea != null && data.yardArea > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-2xl bg-neutral-800/80 border border-white/5 p-5 text-center"
              >
                <Ruler className="h-7 w-7 text-violet-400 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm">Teren</p>
                <p className="text-xl font-bold text-white">{data.yardArea} mp</p>
              </motion.div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-300">
            {data.type === "apartment" && (
              <>
                {data.buildingType && (
                  <p><span className="text-neutral-500">Tip imobil:</span> {BUILDING_TYPE_LABELS[data.buildingType] ?? data.buildingType}</p>
                )}
                {data.floor != null && (
                  <p><span className="text-neutral-500">Etaj:</span> {floorLabel(data.floor)}</p>
                )}
                {data.compartmentType && (
                  <p><span className="text-neutral-500">Compartimentare:</span> <span className="capitalize">{data.compartmentType}</span></p>
                )}
                {data.constructionYear != null && (
                  <p><span className="text-neutral-500">An construcție:</span> {data.constructionYear}</p>
                )}
              </>
            )}
            {data.type === "house" && (
              <>
                {data.buildingType && (
                  <p><span className="text-neutral-500">Tip:</span> {BUILDING_TYPE_LABELS[data.buildingType] ?? data.buildingType}</p>
                )}
                {data.totalFloors != null && (
                  <p><span className="text-neutral-500">Niveluri:</span> {data.totalFloors}</p>
                )}
                {(data.hasBasement || data.hasSemiBasement || data.hasAttic) && (
                  <p><span className="text-neutral-500">Alte:</span>{" "}
                    {[data.hasBasement && "Subsol", data.hasSemiBasement && "Demisol", data.hasAttic && "Mansardă"].filter(Boolean).join(", ")}
                  </p>
                )}
                {data.constructionYear != null && (
                  <p><span className="text-neutral-500">An construcție:</span> {data.constructionYear}</p>
                )}
              </>
            )}
            {data.type === "land" && (
              <>
                {data.landCategory && (
                  <p><span className="text-neutral-500">Tip teren:</span> {LAND_CATEGORY_LABELS[data.landCategory] ?? data.landCategory}</p>
                )}
                {data.streetFrontage != null && (
                  <p><span className="text-neutral-500">Front stradal:</span> {data.streetFrontage} m</p>
                )}
              </>
            )}
            {data.type === "commercial" && data.commercialCategory && (
              <p><span className="text-neutral-500">Categorie:</span> {COMMERCIAL_CATEGORY_LABELS[data.commercialCategory] ?? data.commercialCategory}</p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Descriere */}
      {data.description && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Descriere</h2>
            <p className="text-neutral-300 text-lg leading-relaxed whitespace-pre-wrap">
              {data.description}
            </p>
          </div>
        </motion.section>
      )}

      {/* Harta */}
      {data.mapLocation?.trim() && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative z-10 px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Locație</h2>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <PropertyMapView
                mapLocation={data.mapLocation}
                height={320}
                className="w-full"
              />
            </div>
          </div>
        </motion.section>
      )}

      <footer className="relative z-10 py-12 text-center text-neutral-500 text-sm border-t border-white/5">
        Prezentare generată pentru vizionare. Pentru detalii și contact, solicită link direct de la agent.
      </footer>
    </div>
  );
}
