"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Property } from "@/features/properties/propertyTypes";
import type { PropertyStatus } from "@/features/properties/propertyTypes";
import { getClients } from "@/features/clients/clientMockData";
import { updateProperty } from "@/features/properties/propertyMockData";
import { Home, MapPin, Ruler, Bed, Bath, Calendar, User, Phone, MessageCircle, Send, FileDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

const PropertyMapView = dynamic(
  () => import("./PropertyMapView").then((m) => m.PropertyMapView),
  { ssr: false, loading: () => <div className="h-64 rounded-lg border border-purple-200 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground text-sm">Se încarcă harta…</div> }
);

/** Pentru WhatsApp: adaugă +40 dacă numărul e 07xxxxxxxx */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("7")) return "40" + digits;
  if (digits.length === 10 && digits.startsWith("07")) return "4" + digits;
  if (digits.length >= 10 && !digits.startsWith("4")) return "4" + digits.slice(digits.length - 10);
  return digits.startsWith("4") ? digits : "40" + digits;
}

interface PropertyViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  workspaceId: string | null;
  /** Când e setat, salvare (ex. schimbare status) se face prin API în loc de localStorage */
  onSaveProperty?: (id: string, updates: Partial<Property>) => Promise<Property | null>;
  onPropertyUpdated?: (property: Property) => void;
}

const propertyTypeLabels: Record<Property["type"], string> = {
  apartment: "Apartament",
  house: "Casă",
  land: "Teren",
  commercial: "Comercial",
};

const buildingTypeLabels: Record<string, string> = {
  apartment: "Bloc de apartamente",
  house: "Casă/Vilă",
  villa: "Vilă",
  duplex: "Duplex",
  penthouse: "Penthouse",
  studio: "Studio",
  other: "Altul",
};

const landCategoryLabels: Record<string, string> = {
  intravilan: "Intravilan",
  extravilan: "Extravilan",
  agricultural: "Agricol",
  forest: "Forestier",
};

const landClassificationLabels: Record<string, string> = {
  constructii: "Construcții",
  arabil: "Arabil",
  livada: "Livadă",
  vii: "Vii",
  pasune: "Pășune",
  forestier: "Forestier",
  other: "Altul",
};

const commercialCategoryLabels: Record<string, string> = {
  office: "Birou",
  retail: "Comercial / Retail",
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

const statusConfig: Record<Property["status"], { label: string; color: string }> = {
  available: { label: "Disponibil", color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white" },
  sold: { label: "Vândut", color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white" },
  reserved: { label: "Rezervat", color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white" },
  pending: { label: "În proces", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  withdrawn: { label: "Retras", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white" },
};

export function PropertyViewDialog({ open, onOpenChange, property, workspaceId, onSaveProperty, onPropertyUpdated }: PropertyViewDialogProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waClientId, setWaClientId] = useState<string>("");
  const [waCustomNumber, setWaCustomNumber] = useState("");

  if (!property) return null;

  const presentationUrl = typeof window !== "undefined" ? `${window.location.origin}/prezentare/${property.id}` : "";
  const clientsWithPhone = typeof window !== "undefined" && workspaceId ? getClients(workspaceId).filter((c) => c.phone?.trim()) : [];

  const status = statusConfig[property.status];
  const typeLabel = propertyTypeLabels[property.type];
  const images = property.images ?? [];
  const hasPhone = !!(property.ownerPhone?.trim());
  const telDigits = (property.ownerPhone ?? "").replace(/\D/g, "");
  const telHref =
    telDigits.length >= 10
      ? "tel:+" + (telDigits.startsWith("40") ? telDigits : "40" + telDigits.replace(/^0?/, ""))
      : "tel:" + (property.ownerPhone ?? "").trim().replace(/\s/g, "");
  const waNum = hasPhone ? whatsappNumber(property.ownerPhone!) : "";

  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/properties/prezentare-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(property),
      });
      const data = await res.json();
      if (data.downloadToken && data.filename) {
        const url = `/api/documents/temp-download/${data.downloadToken}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setGalleryIndex(null);
      setWaOpen(false);
    } else {
      setCarouselIndex(0);
    }
    onOpenChange(next);
  };

  const handleSendWhatsApp = () => {
    let phone = "";
    if (waClientId && waClientId !== "__manual__") {
      const client = clientsWithPhone.find((c) => c.id === waClientId);
      phone = client?.phone?.trim() ?? "";
    } else {
      phone = waCustomNumber.trim();
    }
    if (!phone) return;
    const num = whatsappNumber(phone);
    const text = encodeURIComponent(presentationUrl);
    window.open(`https://wa.me/${num}?text=${text}`, "_blank", "noopener,noreferrer");
    setWaOpen(false);
    setWaClientId("");
    setWaCustomNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-purple-200 shadow-xl"
        closeButtonClassName="hidden"
      >
        {/* Bară deasupra pozelor cu buton închidere */}
        <div className="flex justify-end items-center -mt-2 mb-1">
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-lg bg-red-500 hover:bg-red-600 text-white p-2.5 shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              aria-label="Închide"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>
        {/* 1. Poze sus – pe mobil scroll swipe, pe PC săgeți */}
        {images.length > 0 ? (
          <div className="relative">
            {/* Mobil: scroll orizontal cu degetul (swipe stânga/dreapta) */}
            <div
              className="sm:hidden overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex rounded-lg -mx-1"
              style={{ WebkitOverflowScrolling: "touch" }}
              onScroll={(e) => {
                const el = e.currentTarget;
                const index = Math.round(el.scrollLeft / el.offsetWidth);
                setCarouselIndex(Math.min(index, images.length - 1));
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  className="min-w-full w-full shrink-0 snap-center snap-always cursor-pointer"
                  onClick={() => setGalleryIndex(i)}
                >
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted mx-1">
                    <img
                      src={img.url || img.data}
                      alt={img.name || `Poza ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 rounded bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Copertă
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* PC: o imagine + săgeți */}
            <div
              className="hidden sm:block relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted cursor-pointer"
              onClick={() => setGalleryIndex(carouselIndex)}
            >
              <img
                src={images[carouselIndex].url || images[carouselIndex].data}
                alt={images[carouselIndex].name || `Poza ${carouselIndex + 1}`}
                className="h-full w-full object-cover"
              />
              {carouselIndex === 0 && (
                <span className="absolute top-2 left-2 rounded bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">
                  Copertă
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white p-2"
                    onClick={(e) => { e.stopPropagation(); setCarouselIndex((carouselIndex - 1 + images.length) % images.length); }}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white p-2"
                    onClick={(e) => { e.stopPropagation(); setCarouselIndex((carouselIndex + 1) % images.length); }}
                    aria-label="Următor"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-1">
                {carouselIndex + 1} / {images.length}
              </p>
            )}
            {(images[carouselIndex]?.uploadedByName || images[carouselIndex]?.uploadedByUserId) && (
              <p className="text-center text-xs text-muted-foreground mt-0.5">
                Încărcat de: {images[carouselIndex].uploadedByName || `Agent (ID: ${images[carouselIndex].uploadedByUserId})`}
              </p>
            )}
            {/* Lightbox */}
            {galleryIndex !== null && (
              <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setGalleryIndex(null)}>
                <button
                  type="button"
                  className="absolute top-4 right-4 z-10 rounded-lg bg-red-500 hover:bg-red-600 text-white p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black/90"
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(null); }}
                  aria-label="Închide"
                >
                  <X className="h-6 w-6" />
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center text-white hover:bg-white/20 rounded-full p-2"
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex((galleryIndex - 1 + images.length) % images.length); }}
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="h-10 w-10" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center text-white hover:bg-white/20 rounded-full p-2"
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex((galleryIndex + 1) % images.length); }}
                      aria-label="Următor"
                    >
                      <ChevronRight className="h-10 w-10" />
                    </button>
                  </>
                )}
                <img
                  src={images[galleryIndex].url || images[galleryIndex].data}
                  alt=""
                  className="max-h-[90vh] max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {galleryIndex + 1} / {images.length}
                </p>
                {(images[galleryIndex]?.uploadedByName || images[galleryIndex]?.uploadedByUserId) && (
                  <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-xs">
                    Încărcat de: {images[galleryIndex].uploadedByName || `Agent (ID: ${images[galleryIndex].uploadedByUserId})`}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-[16/10] w-full rounded-lg bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="h-20 w-20 text-white/50" />
            </div>
          </div>
        )}

        {/* 2. Titlu, adresă, badge-uri */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {property.title}
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="text-muted-foreground">
                  {[property.street, property.number, property.zone, property.county].filter(Boolean).join(", ") || property.city || "—"}
                </span>
              </DialogDescription>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Badge className={cn("shadow-md", status.color)}>{status.label}</Badge>
              <Badge variant="outline" className="border-purple-200 text-purple-700 font-semibold">
                {typeLabel}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* 3. Preț + Plus TVA / Negociabil dacă sunt bifate */}
        <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Preț</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {property.price.toLocaleString("ro-RO")} {property.priceCurrency || "EUR"}
            {property.transactionType === "rent" && <span className="text-xl">/lună</span>}
          </p>
          {(property.plusVAT || property.negotiable) && (
            <div className="flex flex-wrap justify-center gap-3 mt-2 text-sm">
              {property.plusVAT && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700 font-medium">Plus TVA</span>
              )}
              {property.negotiable && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700 font-medium">Negociabil</span>
              )}
            </div>
          )}
        </div>

        {/* Acțiuni */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-200"
            disabled={linkLoading}
            onClick={async () => {
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const url = `${origin}/prezentare/${property.id}`;

              const copyToClipboard = (text: string): boolean => {
                if (typeof window === "undefined") return false;
                if (navigator.clipboard?.writeText) {
                  try {
                    navigator.clipboard.writeText(text);
                    return true;
                  } catch {
                    // fallback
                  }
                }
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                ta.style.top = "0";
                ta.setAttribute("readonly", "");
                document.body.appendChild(ta);
                ta.select();
                ta.setSelectionRange(0, text.length);
                let ok = false;
                try {
                  ok = document.execCommand("copy");
                } finally {
                  document.body.removeChild(ta);
                }
                return ok;
              };

              const copied = copyToClipboard(url);
              setLinkCopied(copied);
              setTimeout(() => setLinkCopied(false), 3000);

              setLinkLoading(true);
              try {
                const payload = {
                  ...property,
                  createdAt: property.createdAt instanceof Date ? property.createdAt.toISOString() : property.createdAt,
                  updatedAt: property.updatedAt instanceof Date ? property.updatedAt.toISOString() : property.updatedAt,
                };
                await fetch("/api/prezentare", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
              } finally {
                setLinkLoading(false);
              }
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            {linkLoading ? "Se copiază…" : linkCopied ? "Link copiat!" : "Copiază link de prezentare"}
          </Button>
          <Popover open={waOpen} onOpenChange={setWaOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-purple-200">
                <MessageCircle className="mr-2 h-4 w-4" />
                Trimite pe WhatsApp
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Trimite link prezentare pe WhatsApp</p>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Alege client sau introdu numărul</Label>
                  <Select value={waClientId || "__none__"} onValueChange={(v) => setWaClientId(v === "__none__" ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selectează client…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selectează client sau introdu număr</SelectItem>
                      <SelectItem value="__manual__">Introdu număr manual</SelectItem>
                      {clientsWithPhone.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.phone ? `· ${c.phone}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(waClientId === "__manual__" || !waClientId) && (
                    <Input
                      placeholder="07xxxxxxxx sau +40..."
                      value={waCustomNumber}
                      onChange={(e) => setWaCustomNumber(e.target.value)}
                      className="mt-1"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white"
                  onClick={handleSendWhatsApp}
                  disabled={!(waClientId && waClientId !== "__manual__") && !waCustomNumber.trim()}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Deschide WhatsApp
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="border-purple-200" disabled={pdfLoading} onClick={handleGeneratePdf}>
            <FileDown className="mr-2 h-4 w-4" />
            {pdfLoading ? "Se generează…" : "Generează PDF"}
          </Button>
        </div>

        {/* Schimbare stare */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Stare:</span>
          <Select
            value={property.status}
            onValueChange={async (value: PropertyStatus) => {
              if (onSaveProperty) {
                const updated = await onSaveProperty(property.id, { status: value });
                if (updated) onPropertyUpdated?.(updated);
              } else {
                const updated = updateProperty(workspaceId, property.id, { status: value });
                if (updated) onPropertyUpdated?.(updated);
              }
            }}
          >
            <SelectTrigger className="w-[180px] border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">{statusConfig.available.label}</SelectItem>
              <SelectItem value="reserved">{statusConfig.reserved.label}</SelectItem>
              <SelectItem value="pending">{statusConfig.pending.label}</SelectItem>
              <SelectItem value="sold">{statusConfig.sold.label}</SelectItem>
              <SelectItem value="withdrawn">{statusConfig.withdrawn.label}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">

          {/* Proprietar – nume, telefon, WhatsApp, Sună */}
          <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Proprietar</h3>
            <p className="font-medium text-foreground">{property.ownerName || "—"}</p>
            {property.ownerPhone && (
              <p className="text-muted-foreground mt-1">{property.ownerPhone}</p>
            )}
            {hasPhone && (
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={`https://wa.me/${waNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:bg-[#20bd5a]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  <Phone className="h-4 w-4" />
                  Sună
                </a>
              </div>
            )}
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100">
              <Ruler className="h-6 w-6 text-purple-600 mb-2" />
              <p className="text-sm text-muted-foreground">
                {property.type === "land" ? "Suprafață teren" : "Suprafață utilă"}
              </p>
              <p className="text-lg font-bold text-foreground">
                {(property.type === "land" ? property.yardArea : property.usefulArea) ?? property.usefulArea ?? 0} mp
              </p>
            </div>

            {(property.type === "apartment" || property.type === "house") && (property.rooms != null || property.bedrooms != null) && (
              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100">
                <Bed className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">Camere</p>
                <p className="text-lg font-bold text-foreground">{property.rooms ?? property.bedrooms ?? "—"}</p>
              </div>
            )}

            {(property.type === "apartment" || property.type === "house") && property.bathrooms != null && (
              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100">
                <Bath className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">Băi</p>
                <p className="text-lg font-bold text-foreground">{property.bathrooms}</p>
              </div>
            )}

            {property.type === "house" && (property.yardArea != null && property.yardArea > 0) && (
              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100">
                <Ruler className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">Suprafață teren</p>
                <p className="text-lg font-bold text-foreground">{property.yardArea} mp</p>
              </div>
            )}

            <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100">
              <User className="h-6 w-6 text-purple-600 mb-2" />
              <p className="text-sm text-muted-foreground">Agent</p>
              <p className="text-sm font-semibold text-foreground">{property.agentName}</p>
            </div>
          </div>

          {/* Detalii după tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {property.type === "apartment" && (
              <>
                {property.buildingType && (
                  <div><span className="text-muted-foreground">Tip imobil:</span> <span className="font-medium">{buildingTypeLabels[property.buildingType] ?? property.buildingType}</span></div>
                )}
                {property.floor != null && (
                  <div><span className="text-muted-foreground">Etaj:</span> <span className="font-medium">{floorLabel(property.floor)}</span></div>
                )}
                {property.compartmentType && (
                  <div><span className="text-muted-foreground">Compartimentare:</span> <span className="font-medium capitalize">{property.compartmentType}</span></div>
                )}
                {property.comfort && (
                  <div><span className="text-muted-foreground">Confort:</span> <span className="font-medium">{property.comfort}</span></div>
                )}
              </>
            )}
            {property.type === "house" && (
              <>
                {property.buildingType && (
                  <div><span className="text-muted-foreground">Tip locuință:</span> <span className="font-medium">{buildingTypeLabels[property.buildingType] ?? property.buildingType}</span></div>
                )}
                {property.totalFloors != null && (
                  <div><span className="text-muted-foreground">Nr. niveluri:</span> <span className="font-medium">{property.totalFloors}</span></div>
                )}
                {(property.hasBasement || property.hasSemiBasement || property.hasAttic) && (
                  <div><span className="text-muted-foreground">Alte:</span> <span className="font-medium">
                    {[property.hasBasement && "Subsol", property.hasSemiBasement && "Demisol", property.hasAttic && "Mansardă"].filter(Boolean).join(", ")}
                  </span></div>
                )}
                {property.constructionYear != null && (
                  <div><span className="text-muted-foreground">An construcție:</span> <span className="font-medium">{property.constructionYear}</span></div>
                )}
              </>
            )}
            {property.type === "land" && (
              <>
                {property.landCategory && (
                  <div><span className="text-muted-foreground">Tip teren:</span> <span className="font-medium">{landCategoryLabels[property.landCategory] ?? property.landCategory}</span></div>
                )}
                {property.landClassification && (
                  <div><span className="text-muted-foreground">Clasificare:</span> <span className="font-medium">{landClassificationLabels[property.landClassification] ?? property.landClassification}</span></div>
                )}
                {property.streetFrontage != null && (
                  <div><span className="text-muted-foreground">Front stradal:</span> <span className="font-medium">{property.streetFrontage} m</span></div>
                )}
              </>
            )}
            {property.type === "commercial" && property.commercialCategory && (
              <div><span className="text-muted-foreground">Categorie:</span> <span className="font-medium">{commercialCategoryLabels[property.commercialCategory] ?? property.commercialCategory}</span></div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Descriere</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-muted-foreground">Adăugat</p>
                <p className="font-medium">{format(property.createdAt, "d MMMM yyyy", { locale: ro })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-muted-foreground">Actualizat</p>
                <p className="font-medium">{format(property.updatedAt, "d MMMM yyyy", { locale: ro })}</p>
              </div>
            </div>
          </div>

          {/* Harta – jos de tot */}
          {property.mapLocation?.trim() && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Locație pe hartă</h3>
                <PropertyMapView mapLocation={property.mapLocation} height={280} className="w-full" />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
