"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Property } from "@/features/properties/propertyTypes";
import { getClients } from "@/features/clients/clientMockData";
import { Home, MapPin, Ruler, Bed, Bath, Edit, Trash2, Eye, Link, Send } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface PropertyCardProps {
  property: Property;
  workspaceId: string | null;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onView: (property: Property) => void;
}

/** Pentru WhatsApp: formatează număr românesc (07xxxxxxxx) la format internațional. */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("7")) return "40" + digits;
  if (digits.length === 10 && digits.startsWith("07")) return "4" + digits;
  if (digits.length >= 10 && !digits.startsWith("4")) return "4" + digits.slice(digits.length - 10);
  return digits.startsWith("4") ? digits : "40" + digits;
}

const propertyTypeLabels: Record<Property["type"], string> = {
  apartment: "Apartament",
  house: "Casă",
  land: "Teren",
  commercial: "Comercial",
};

const buildingTypeLabels: Record<string, string> = {
  apartment: "Bloc",
  house: "Casă/Vilă",
  villa: "Vilă",
  duplex: "Duplex",
};

const landCategoryLabels: Record<string, string> = {
  intravilan: "Intravilan",
  extravilan: "Extravilan",
  agricultural: "Agricol",
  forest: "Forestier",
};

const commercialCategoryLabels: Record<string, string> = {
  office: "Birou",
  retail: "Comercial",
  restaurant: "Restaurant",
  warehouse: "Depozit",
  other: "Altul",
};

const statusConfig: Record<Property["status"], { label: string; color: string }> = {
  available: { label: "Disponibil", color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white" },
  sold: { label: "Vândut", color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white" },
  reserved: { label: "Rezervat", color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white" },
  pending: { label: "În proces", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  withdrawn: { label: "Retras", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white" },
};

export function PropertyCard({ property, workspaceId, onEdit, onDelete, onView }: PropertyCardProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const status = statusConfig[property.status];
  const typeLabel = propertyTypeLabels[property.type];
  const presentationUrl = typeof window !== "undefined" ? `${window.location.origin}/prezentare/${property.id}` : "";
  const clientsWithPhone = workspaceId ? getClients(workspaceId).filter((c) => c.phone?.trim()) : [];

  const openWhatsApp = (phone: string) => {
    const num = whatsappNumber(phone.trim());
    if (!num) return;
    const text = encodeURIComponent(presentationUrl);
    window.open(`https://wa.me/${num}?text=${text}`, "_blank", "noopener,noreferrer");
    setProposeOpen(false);
    setManualPhone("");
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/prezentare/${property.id}` : "";
    if (!url) return;

    const doCopy = async () => {
      let ok = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          ok = true;
        }
      } catch {
        /* fallback */
      }
      if (!ok) {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "0";
        ta.style.top = "0";
        ta.style.width = "2px";
        ta.style.height = "2px";
        ta.style.opacity = "0";
        ta.style.pointerEvents = "none";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, url.length);
        try {
          ok = document.execCommand("copy");
        } finally {
          document.body.removeChild(ta);
        }
      }
      setLinkCopied(ok);
      setTimeout(() => setLinkCopied(false), 2000);
    };

    doCopy();
  };

  return (
    <Card className="group border-2 border-purple-200/50 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/10 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
      {/* Imagine: pe mobil deasupra (full width), de la sm în stânga (lățime fixă) */}
      <div className="relative w-full h-48 sm:w-64 sm:h-44 sm:shrink-0 bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300 overflow-hidden">
        {(property.images?.[0]?.url || property.images?.[0]?.data) ? (
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.images[0].url || property.images[0].data}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="h-14 w-14 text-white/50" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge className={cn("shadow-md text-xs", status.color)}>{status.label}</Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 font-semibold text-xs">
            {typeLabel}
          </Badge>
        </div>
      </div>

      {/* Conținut în dreapta – flex-1, aliniat frumos */}
      <div className="flex flex-1 flex-col min-w-0 p-4 sm:p-5">
        <CardHeader className="p-0 pb-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-purple-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span className="truncate">
              {[property.street, property.number, property.zone, property.county].filter(Boolean).join(", ") || property.city || "—"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-2 p-0 py-2">
          {/* Preț */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {property.price.toLocaleString("ro-RO")} {property.priceCurrency || "EUR"}
            </span>
            {property.transactionType === "rent" && (
              <span className="text-sm text-muted-foreground">/lună</span>
            )}
          </div>

          {/* Detalii pe un rând */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {property.type === "land" ? (
              <>
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-purple-600" />
                  <span className="font-medium">{property.yardArea ?? 0} mp</span>
                </div>
                {property.landCategory && (
                  <span className="font-medium">{landCategoryLabels[property.landCategory] ?? property.landCategory}</span>
                )}
              </>
            ) : property.type === "commercial" ? (
              <>
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-purple-600" />
                  <span className="font-medium">{property.usefulArea ?? 0} mp</span>
                </div>
                {property.commercialCategory && (
                  <span className="font-medium">{commercialCategoryLabels[property.commercialCategory] ?? property.commercialCategory}</span>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-purple-600" />
                  <span className="font-medium">{property.usefulArea ?? 0} mp</span>
                </div>
                {(property.rooms != null || property.bedrooms != null) && (
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-3.5 w-3.5 text-purple-600" />
                    <span className="font-medium">{property.rooms ?? property.bedrooms} camere</span>
                  </div>
                )}
                {property.bathrooms != null && (
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-3.5 w-3.5 text-purple-600" />
                    <span className="font-medium">{property.bathrooms} băi</span>
                  </div>
                )}
                {property.type === "house" && (property.yardArea != null && property.yardArea > 0) && (
                  <span className="font-medium">{property.yardArea} mp teren</span>
                )}
                {property.type === "apartment" && property.buildingType && (
                  <span className="font-medium">{buildingTypeLabels[property.buildingType] ?? property.buildingType}</span>
                )}
              </>
            )}
          </div>

          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Actualizat: {format(property.updatedAt, "d MMM yyyy", { locale: ro })}
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 p-0 pt-2 border-t border-purple-100/80 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
            onClick={() => onView(property)}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            Vezi
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
            onClick={() => onEdit(property)}
          >
            <Edit className="mr-1.5 h-4 w-4" />
            Editează
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            onClick={() => setProposeOpen(true)}
            title="Propune unui client pe WhatsApp"
          >
            <Send className="mr-1.5 h-4 w-4" />
            Propune client
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
            onClick={handleCopyLink}
            title={linkCopied ? "Link copiat!" : "Copiază link prezentare"}
          >
            <Link className={cn("mr-1.5 h-4 w-4 shrink-0", linkCopied && "text-green-600")} />
            {linkCopied ? "Copiat!" : "Copiază link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(property.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </div>

      {/* Dialog Propune unui client */}
      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent className="sm:max-w-md bg-white border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-lg">Propune proprietatea unui client</DialogTitle>
            <DialogDescription>
              Alege un client din listă sau introdu numărul de telefon. Se deschide WhatsApp cu link-ul prezentării.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {clientsWithPhone.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Clienți cu telefon</Label>
                <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-purple-200 divide-y divide-purple-100">
                  {clientsWithPhone.map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 flex justify-between items-center"
                        onClick={() => openWhatsApp(client.phone!)}
                      >
                        <span className="font-medium text-foreground">{client.name}</span>
                        <span className="text-sm text-muted-foreground">{client.phone}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <Label htmlFor="manual-phone" className="text-sm font-medium text-muted-foreground">
                {clientsWithPhone.length > 0 ? "Sau introdu număr manual" : "Număr de telefon"}
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="manual-phone"
                  type="tel"
                  placeholder="07xxxxxxxx"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="border-purple-200"
                />
                <Button
                  type="button"
                  onClick={() => openWhatsApp(manualPhone)}
                  disabled={!manualPhone.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                >
                  <Send className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
