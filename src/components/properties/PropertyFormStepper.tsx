"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Property, PropertyFormData, CompartmentType } from "@/features/properties/propertyTypes";
import { normalizePropertyImages } from "@/features/properties/propertyTypes";
import { PropertyImageUploader } from "@/components/properties/PropertyImageUploader";
import { PriceInput } from "@/components/properties/PriceInput";
import { geocodeAddressFull } from "@/features/properties/geocode";
import { ChevronLeft, ChevronRight, Check, MapPin, Home, Image, DollarSign, Save, MapPinned, Globe } from "lucide-react";

const MapPinPicker = dynamic(
  () => import("./MapPinPicker").then((m) => m.MapPinPicker),
  { ssr: false, loading: () => <div className="h-[280px] rounded-lg border border-purple-200 bg-muted/30 animate-pulse" /> }
);

interface PropertyFormStepperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
  onSave: (data: PropertyFormData) => void;
}

const steps = [
  { id: 1, label: "Contact și adresă", icon: MapPin },
  { id: 2, label: "Caracteristici", icon: Home },
  { id: 3, label: "Poze", icon: Image },
  { id: 4, label: "Preț", icon: DollarSign },
  { id: 5, label: "Salvează", icon: Save },
];

function buildAddressDisplay(p: { street?: string; number?: string; zone?: string; county?: string }): string {
  return [p.street, p.number, p.zone, p.county].filter(Boolean).join(", ") || "";
}

export function PropertyFormStepper({ open, onOpenChange, property, onSave }: PropertyFormStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [mapSearching, setMapSearching] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [landPriceType, setLandPriceType] = useState<"mp" | "total">("total");
  const [formData, setFormData] = useState<PropertyFormData>({
    transactionType: "sale",
    type: "apartment",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    county: "",
    zone: "",
    street: "",
    number: "",
    mapLocation: "",
    floor: undefined,
    totalFloors: undefined,
    comfort: undefined,
    usefulArea: 0,
    totalArea: undefined,
    balconyArea: undefined,
    terraceArea: undefined,
    yardArea: undefined,
    bedrooms: undefined,
    rooms: undefined,
    bathrooms: undefined,
    balconies: undefined,
    terraces: undefined,
    parkingSpots: undefined,
    buildingType: undefined,
    compartmentType: undefined,
    constructionYear: undefined,
    hasAttic: false,
    hasBasement: false,
    hasSemiBasement: false,
    heatingSystem: undefined,
    heatingType: undefined,
    hasElevator: undefined,
    orientation: undefined,
    exposure: undefined,
    roofType: undefined,
    foundationType: undefined,
    accessRoad: undefined,
    landCategory: undefined,
    landClassification: undefined,
    streetFrontage: undefined,
    utilities: undefined,
    roadAccess: undefined,
    commercialCategory: undefined,
    allowedActivity: undefined,
    visibility: undefined,
    footTraffic: undefined,
    deposit: undefined,
    minRentalPeriod: undefined,
    utilitiesIncluded: undefined,
    documentsReady: undefined,
    availableFrom: undefined,
    mortgageAvailable: undefined,
    title: "",
    description: "",
    images: [],
    price: 0,
    priceCurrency: "EUR",
    plusVAT: false,
    negotiable: false,
    commissionType: "custom",
    commissionPercent: 2,
    status: "available",
    city: "",
    showOnSite: false,
    featuredOnSite: false,
  });

  useEffect(() => {
    if (property) {
      setAddressInput(
        buildAddressDisplay({
          street: property.street,
          number: property.number,
          zone: property.zone,
          county: property.county,
        })
      );
      setFormData({
        transactionType: property.transactionType || "sale",
        type: property.type,
        ownerName: property.ownerName || "",
        ownerPhone: property.ownerPhone || "",
        ownerEmail: property.ownerEmail || "",
        county: property.county || "",
        zone: property.zone || "",
        street: property.street || "",
        number: property.number || "",
        mapLocation: property.mapLocation || "",
        floor: property.floor,
        totalFloors: property.totalFloors,
        comfort: property.comfort,
        usefulArea: property.usefulArea || 0,
        totalArea: property.totalArea,
        balconyArea: property.balconyArea,
        terraceArea: property.terraceArea,
        yardArea: property.yardArea,
        bedrooms: property.bedrooms,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        balconies: property.balconies,
        terraces: property.terraces,
        parkingSpots: property.parkingSpots,
        buildingType: property.buildingType,
        compartmentType: property.compartmentType,
        constructionYear: property.constructionYear,
        hasAttic: property.hasAttic || false,
        hasBasement: property.hasBasement || false,
        hasSemiBasement: property.hasSemiBasement || false,
        heatingSystem: property.heatingSystem,
        heatingType: property.heatingType,
        hasElevator: property.hasElevator,
        orientation: property.orientation,
        exposure: property.exposure,
        roofType: property.roofType,
        foundationType: property.foundationType,
        accessRoad: property.accessRoad,
        landCategory: property.landCategory,
        landClassification: property.landClassification,
        streetFrontage: property.streetFrontage,
        utilities: property.utilities,
        roadAccess: property.roadAccess,
        commercialCategory: property.commercialCategory,
        allowedActivity: property.allowedActivity,
        visibility: property.visibility,
        footTraffic: property.footTraffic,
        deposit: property.deposit,
        minRentalPeriod: property.minRentalPeriod,
        utilitiesIncluded: property.utilitiesIncluded,
        documentsReady: property.documentsReady,
        availableFrom: property.availableFrom,
        mortgageAvailable: property.mortgageAvailable,
        title: property.title || "",
        description: property.description || "",
        images: normalizePropertyImages(property.images),
        price: property.price || 0,
        priceCurrency: property.priceCurrency || "EUR",
        plusVAT: property.plusVAT || false,
        negotiable: property.negotiable || false,
        commissionType: property.commissionType || "none",
        commissionPercent: property.commissionPercent,
        status: property.status,
        city: property.city || "",
        showOnSite: property.showOnSite ?? false,
        featuredOnSite: property.featuredOnSite ?? false,
      });
    } else {
      // Reset form
      setAddressInput("");
      setFormData({
        transactionType: "sale",
        type: "apartment",
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
        county: "",
        zone: "",
        street: "",
        number: "",
        mapLocation: "",
        floor: undefined,
        totalFloors: undefined,
        comfort: undefined,
        usefulArea: 0,
        totalArea: undefined,
        balconyArea: undefined,
        terraceArea: undefined,
        yardArea: undefined,
        bedrooms: undefined,
        rooms: undefined,
        bathrooms: undefined,
        balconies: undefined,
        terraces: undefined,
        parkingSpots: undefined,
        buildingType: undefined,
        constructionYear: undefined,
        hasAttic: false,
        hasBasement: false,
        hasSemiBasement: false,
        heatingSystem: undefined,
        heatingType: undefined,
        hasElevator: undefined,
        orientation: undefined,
        exposure: undefined,
        roofType: undefined,
        foundationType: undefined,
        accessRoad: undefined,
        landCategory: undefined,
        landClassification: undefined,
        streetFrontage: undefined,
        utilities: undefined,
        roadAccess: undefined,
        commercialCategory: undefined,
        allowedActivity: undefined,
        visibility: undefined,
        footTraffic: undefined,
        deposit: undefined,
        minRentalPeriod: undefined,
        utilitiesIncluded: undefined,
        documentsReady: undefined,
        availableFrom: undefined,
        mortgageAvailable: undefined,
        title: "",
        description: "",
        images: [],
        price: 0,
        priceCurrency: "EUR",
        plusVAT: false,
        negotiable: false,
        commissionType: "custom",
        commissionPercent: 2,
        status: "available",
        city: "",
        showOnSite: false,
        featuredOnSite: false,
      });
    }
    setCurrentStep(1);
  }, [property, open]);

  // Setează comisionul standard când se schimbă tipul tranzacției (doar pentru proprietăți noi)
  useEffect(() => {
    if (!property && formData.transactionType) {
      if (formData.transactionType === "rent") {
        // Pentru închiriere: comision standard 50%
        updateField("commissionType", "custom");
        updateField("commissionPercent", 50);
      } else if (formData.transactionType === "sale") {
        // Pentru vânzare: comision standard 2%
        updateField("commissionType", "custom");
        updateField("commissionPercent", 2);
      }
    }
  }, [formData.transactionType, property]);

  const handleSave = () => {
    // Validare minimă: tip proprietate și tip tranzacție
    if (!formData.type || !formData.transactionType) {
      return;
    }
    // Dacă utilizatorul a introdus adresă dar nu a căutat, păstrăm textul în street
    const dataToSave = { ...formData };
    if (!dataToSave.street?.trim() && addressInput.trim()) {
      dataToSave.street = addressInput.trim();
    }
    // Pentru teren: usefulArea = yardArea (suprafața terenului)
    if (dataToSave.type === "land" && (dataToSave.usefulArea ?? 0) === 0 && (dataToSave.yardArea ?? 0) > 0) {
      dataToSave.usefulArea = dataToSave.yardArea!;
    }
    onSave(dataToSave);
    onOpenChange(false);
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return formData.type && formData.transactionType;
    }
    return true; // Alți pași nu au validări obligatorii
  };

  const nextStep = () => {
    if (currentStep < steps.length && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= steps.length) {
      setCurrentStep(step);
    }
  };

  const updateField = <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return;
    setMapSearching(true);
    try {
      const result = await geocodeAddressFull(addressInput.trim());
      if (result) {
        updateField("mapLocation", `${result.lat.toFixed(6)},${result.lng.toFixed(6)}`);
        if (result.street) updateField("street", result.street);
        if (result.number) updateField("number", result.number);
        if (result.zone) updateField("zone", result.zone);
        if (result.county) updateField("county", result.county);
        setAddressInput(
          result.displayName ||
            buildAddressDisplay({
              street: result.street,
              number: result.number,
              zone: result.zone,
              county: result.county,
            }) ||
            addressInput
        );
      }
    } finally {
      setMapSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-purple-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl">
            {property ? "Editează Proprietate" : "Adaugă Proprietate Nouă"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completează informațiile despre proprietate pas cu pas
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 flex-1 transition-all hover:opacity-80",
                    isActive && "cursor-default",
                    !isActive && "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isActive && "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 text-white",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      !isActive && !isCompleted && "border-purple-200 bg-white text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center",
                      isActive && "text-purple-600 font-semibold",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-full mx-2",
                      currentStep > step.id ? "bg-green-500" : "bg-purple-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Step 1: Contact și adresă */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Contact și adresă</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Tip ofertă *</Label>
                  <Select
                    value={formData.transactionType}
                    onValueChange={(value: "sale" | "rent") => {
                      updateField("transactionType", value);
                      // Setează automat comisionul standard când se schimbă tipul tranzacției
                      if (!property) {
                        // Doar pentru proprietăți noi
                        updateField("commissionType", "custom");
                        updateField("commissionPercent", value === "rent" ? 50 : 2);
                      }
                    }}
                    required
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Vânzare</SelectItem>
                      <SelectItem value="rent">Închiriere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tip proprietate *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Property["type"]) => updateField("type", value)}
                    required
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue placeholder="— Alege tipul —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartament</SelectItem>
                      <SelectItem value="house">Casă</SelectItem>
                      <SelectItem value="land">Teren</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nume proprietar</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    placeholder="Numele proprietarului"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Telefon</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => updateField("ownerPhone", e.target.value)}
                    placeholder="07xx xxx xxx"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => updateField("ownerEmail", e.target.value)}
                    placeholder="email@exemplu.ro"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="addressSearch">Adresă (stradă, cartier sau oraș)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="addressSearch"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddressSearch())}
                      placeholder="ex: Strada Victoriei 10, Sector 1, București"
                      className="border-purple-200 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-purple-200 shrink-0"
                      disabled={mapSearching || !addressInput.trim()}
                      onClick={handleAddressSearch}
                    >
                      <MapPinned className="mr-1.5 h-4 w-4" />
                      {mapSearching ? "Se caută…" : "Caută"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Locație pe hartă</Label>
                  <p className="text-xs text-muted-foreground">
                    Caută adresa apoi apasă pe hartă pentru a ajusta pinul exact.
                  </p>
                  <MapPinPicker
                    value={formData.mapLocation}
                    onChange={(v) => updateField("mapLocation", v || "")}
                    height={280}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Caracteristici */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {formData.type === "apartment" || formData.type === "house" || formData.type === "land" || formData.type === "commercial"
                  ? "Detalii proprietate *"
                  : "Caracteristici"}
              </h3>

              {/* Variantă simplificată: Apartament (vânzare sau închiriere) */}
              {formData.type === "apartment" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nr. camere *</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, "5+"].map((v) => {
                        const num = v === "5+" ? 5 : (v as number);
                        const isSelected = formData.rooms === num;
                        return (
                          <Button
                            key={String(v)}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "min-w-[2.5rem]",
                              isSelected && "bg-purple-600 hover:bg-purple-700"
                            )}
                            onClick={() => updateField("rooms", num)}
                          >
                            {v}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nr. băi</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, "2+"].map((v) => {
                        const num = v === "2+" ? 2 : (v as number);
                        const b = formData.bathrooms ?? 0;
                        const isSelected = num === 1 ? b === 1 : b >= 2;
                        return (
                          <Button
                            key={String(v)}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "min-w-[2.5rem]",
                              isSelected && "bg-purple-600 hover:bg-purple-700"
                            )}
                            onClick={() => updateField("bathrooms", num)}
                          >
                            {v}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Compartimentare</Label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { v: "decomandat" as const, l: "Decomandat" },
                          { v: "semidecomandat" as const, l: "Semidecomandat" },
                          { v: "nedecomandat" as const, l: "Nedecomandat" },
                          { v: "circular" as const, l: "Circular" },
                        ] as const
                      ).map(({ v, l }) => {
                        const isSelected = formData.compartmentType === v;
                        return (
                          <Button
                            key={v}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "text-xs",
                              isSelected && "bg-purple-600 hover:bg-purple-700"
                            )}
                            onClick={() => updateField("compartmentType", v)}
                          >
                            {l}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confort</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { v: "1" as const, l: "1" },
                        { v: "2" as const, l: "2" },
                        { v: "3" as const, l: "3" },
                        { v: "luxury" as const, l: "Lux" },
                      ].map(({ v, l }) => {
                        const isSelected = formData.comfort === v;
                        return (
                          <Button
                            key={v}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "min-w-[2.5rem]",
                              isSelected && "bg-purple-600 hover:bg-purple-700"
                            )}
                            onClick={() => updateField("comfort", v)}
                          >
                            {l}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Etaj *</Label>
                    <Select
                      value={
                        formData.floor == null
                          ? ""
                          : formData.floor === -1
                            ? "demisol"
                            : formData.floor === 0
                              ? "parter"
                              : formData.floor === 98
                                ? "ultimele2"
                                : formData.floor === 99
                                  ? "mansarda"
                                  : String(formData.floor)
                      }
                      onValueChange={(v) => {
                        if (!v) return;
                        const num =
                          v === "demisol"
                            ? -1
                            : v === "parter"
                              ? 0
                              : v === "ultimele2"
                                ? 98
                                : v === "mansarda"
                                  ? 99
                                  : parseInt(v, 10);
                        updateField("floor", num);
                      }}
                    >
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Alege" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demisol">Demisol</SelectItem>
                        <SelectItem value="parter">Parter</SelectItem>
                        {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            Etaj {n}
                          </SelectItem>
                        ))}
                        <SelectItem value="mansarda">Mansardă</SelectItem>
                        <SelectItem value="ultimele2">Ultimele 2 etaje</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalFloors">Nr. niveluri peste parter</Label>
                    <Input
                      id="totalFloors"
                      type="number"
                      min={0}
                      value={formData.totalFloors ?? ""}
                      onChange={(e) =>
                        updateField("totalFloors", e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Introdu nr. etaje"
                      className="border-purple-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tip imobil</Label>
                    <Select
                      value={formData.buildingType ?? ""}
                      onValueChange={(v) =>
                        updateField("buildingType", (v || undefined) as PropertyFormData["buildingType"])
                      }
                    >
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Alege" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Bloc de apartamente</SelectItem>
                        <SelectItem value="house">Casă/Vilă</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usefulArea">Suprafață utilă *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="usefulArea"
                        type="number"
                        min={0}
                        value={formData.usefulArea || ""}
                        onChange={(e) => updateField("usefulArea", Number(e.target.value) || 0)}
                        placeholder="Introdu suprafața utilă"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        mp
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Comision cumpărător</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formData.commissionType === "none" || !formData.commissionPercent
                          ? "0%"
                          : `${formData.commissionPercent}%`}
                      </span>
                      <div className="flex rounded-lg border border-purple-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "none");
                            updateField("commissionPercent", 0);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "none"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Nu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "custom");
                            updateField("commissionPercent", formData.commissionPercent || 2);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "custom"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Da
                        </button>
                      </div>
                      {formData.commissionType === "custom" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={formData.commissionPercent ?? ""}
                            onChange={(e) =>
                              updateField("commissionPercent", e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-16 border-purple-200 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constructionYear">Anul construcției</Label>
                    <Input
                      id="constructionYear"
                      type="number"
                      min={1800}
                      max={new Date().getFullYear()}
                      value={formData.constructionYear ?? ""}
                      onChange={(e) =>
                        updateField("constructionYear", e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Introdu anul"
                      className="border-purple-200"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Titlu anunț</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Titlul anunțului"
                      maxLength={65}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{formData.title.length}/65</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value || undefined)}
                      placeholder="Descriere detaliată"
                      rows={4}
                      maxLength={2500}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{(formData.description || "").length}/2500</p>
                  </div>
                </div>
              ) : formData.type === "house" ? (
                /* Variantă simplificată: Casă (vânzare sau închiriere) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nr. camere *</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, "5+"].map((v) => {
                        const num = v === "5+" ? 5 : (v as number);
                        const isSelected = formData.rooms === num;
                        return (
                          <Button
                            key={String(v)}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "min-w-[2.5rem]",
                              isSelected && "bg-purple-600 hover:bg-purple-700"
                            )}
                            onClick={() => updateField("rooms", num)}
                          >
                            {v}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nr. băi</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, "2+"].map((v) => {
                        const num = v === "2+" ? 2 : (v as number);
                        const b = formData.bathrooms ?? 0;
                        const isSelected = num === 1 ? b === 1 : b >= 2;
                        return (
                          <Button
                            key={String(v)}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "min-w-[2.5rem]",
                              isSelected && "bg-purple-600 hover:bg-purple-700"
                            )}
                            onClick={() => updateField("bathrooms", num)}
                          >
                            {v}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tip locuință *</Label>
                    <Select
                      value={formData.buildingType ?? ""}
                      onValueChange={(v) =>
                        updateField("buildingType", (v || undefined) as PropertyFormData["buildingType"])
                      }
                    >
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Alege" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casă</SelectItem>
                        <SelectItem value="villa">Vilă</SelectItem>
                        <SelectItem value="duplex">Duplex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalFloors">Nr. niveluri peste parter</Label>
                    <Input
                      id="totalFloors"
                      type="number"
                      min={0}
                      value={formData.totalFloors ?? ""}
                      onChange={(e) =>
                        updateField("totalFloors", e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Introdu nr. etaje"
                      className="border-purple-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usefulArea">Suprafață utilă *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="usefulArea"
                        type="number"
                        min={0}
                        value={formData.usefulArea || ""}
                        onChange={(e) => updateField("usefulArea", Number(e.target.value) || 0)}
                        placeholder="Introdu suprafața utilă"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        mp
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yardArea">Suprafață teren *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="yardArea"
                        type="number"
                        min={0}
                        value={formData.yardArea ?? ""}
                        onChange={(e) =>
                          updateField("yardArea", e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="Introdu suprafața teren"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        mp
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2 flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasBasement"
                        checked={formData.hasBasement}
                        onCheckedChange={(checked) => updateField("hasBasement", checked === true)}
                      />
                      <Label htmlFor="hasBasement" className="cursor-pointer">Subsol</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSemiBasement"
                        checked={formData.hasSemiBasement}
                        onCheckedChange={(checked) => updateField("hasSemiBasement", checked === true)}
                      />
                      <Label htmlFor="hasSemiBasement" className="cursor-pointer">Demisol</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasAttic"
                        checked={formData.hasAttic}
                        onCheckedChange={(checked) => updateField("hasAttic", checked === true)}
                      />
                      <Label htmlFor="hasAttic" className="cursor-pointer">Mansardă</Label>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Comision cumpărător</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formData.commissionType === "none" || !formData.commissionPercent
                          ? "0%"
                          : `${formData.commissionPercent}%`}
                      </span>
                      <div className="flex rounded-lg border border-purple-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "none");
                            updateField("commissionPercent", 0);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "none"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Nu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "custom");
                            updateField("commissionPercent", formData.commissionPercent || 2);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "custom"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Da
                        </button>
                      </div>
                      {formData.commissionType === "custom" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={formData.commissionPercent ?? ""}
                            onChange={(e) =>
                              updateField("commissionPercent", e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-16 border-purple-200 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constructionYear">Anul construcției</Label>
                    <Input
                      id="constructionYear"
                      type="number"
                      min={1800}
                      max={new Date().getFullYear()}
                      value={formData.constructionYear ?? ""}
                      onChange={(e) =>
                        updateField("constructionYear", e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Introdu anul"
                      className="border-purple-200"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Titlu anunț</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Titlul anunțului"
                      maxLength={65}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{formData.title.length}/65</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value || undefined)}
                      placeholder="Descriere detaliată"
                      rows={4}
                      maxLength={2500}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{(formData.description || "").length}/2500</p>
                  </div>
                </div>
              ) : formData.type === "land" ? (
                /* Variantă simplificată: Teren (vânzare sau închiriere) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tip teren *</Label>
                    <Select
                      value={formData.landCategory ?? ""}
                      onValueChange={(v) =>
                        updateField("landCategory", (v || undefined) as PropertyFormData["landCategory"])
                      }
                    >
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Alege" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intravilan">Intravilan</SelectItem>
                        <SelectItem value="extravilan">Extravilan</SelectItem>
                        <SelectItem value="agricultural">Agricol</SelectItem>
                        <SelectItem value="forest">Forestier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Clasificare teren *</Label>
                    <Select
                      value={formData.landClassification ?? ""}
                      onValueChange={(v) =>
                        updateField("landClassification", (v || undefined) as PropertyFormData["landClassification"])
                      }
                    >
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Alege" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="constructii">Construcții</SelectItem>
                        <SelectItem value="arabil">Arabil</SelectItem>
                        <SelectItem value="livada">Livadă</SelectItem>
                        <SelectItem value="vii">Vii</SelectItem>
                        <SelectItem value="pasune">Pășune</SelectItem>
                        <SelectItem value="forestier">Forestier</SelectItem>
                        <SelectItem value="other">Altul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yardArea">Suprafață teren *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="yardArea"
                        type="number"
                        min={0}
                        value={formData.yardArea ?? ""}
                        onChange={(e) =>
                          updateField("yardArea", e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="Introdu suprafața teren"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        mp
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="streetFrontage">Front stradal *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="streetFrontage"
                        type="number"
                        min={0}
                        value={formData.streetFrontage ?? ""}
                        onChange={(e) =>
                          updateField("streetFrontage", e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="Introdu front stradal"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        m
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preț solicitat *</Label>
                    <div className="flex gap-2">
                      <div className="flex rounded-lg border border-purple-200 p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setLandPriceType("mp")}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            landPriceType === "mp"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          mp
                        </button>
                        <button
                          type="button"
                          onClick={() => setLandPriceType("total")}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            landPriceType === "total"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          total
                        </button>
                      </div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={
                          landPriceType === "mp" && (formData.yardArea ?? 0) > 0
                            ? Math.round(formData.price / (formData.yardArea ?? 1)).toLocaleString("ro-RO")
                            : formData.price > 0
                              ? formData.price.toLocaleString("ro-RO")
                              : ""
                        }
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          const num = digits ? parseInt(digits, 10) : 0;
                          if (landPriceType === "mp" && (formData.yardArea ?? 0) > 0) {
                            updateField("price", num * (formData.yardArea ?? 1));
                          } else {
                            updateField("price", num);
                          }
                        }}
                        placeholder="Introdu preț"
                        className="border-purple-200 flex-1"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground shrink-0">
                        €
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Comision cumpărător</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formData.commissionType === "none" || !formData.commissionPercent
                          ? "0%"
                          : `${formData.commissionPercent}%`}
                      </span>
                      <div className="flex rounded-lg border border-purple-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "none");
                            updateField("commissionPercent", 0);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "none"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Nu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "custom");
                            updateField("commissionPercent", formData.commissionPercent || 2);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "custom"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Da
                        </button>
                      </div>
                      {formData.commissionType === "custom" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={formData.commissionPercent ?? ""}
                            onChange={(e) =>
                              updateField("commissionPercent", e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-16 border-purple-200 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Titlu anunț</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Titlul anunțului"
                      maxLength={65}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{formData.title.length}/65</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value || undefined)}
                      placeholder="Descriere detaliată"
                      rows={4}
                      maxLength={2500}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{(formData.description || "").length}/2500</p>
                  </div>
                </div>
              ) : formData.type === "commercial" ? (
                /* Variantă simplificată: Spațiu comercial (vânzare sau închiriere) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categorie *</Label>
                    <Select
                      value={formData.commercialCategory ?? ""}
                      onValueChange={(v) =>
                        updateField("commercialCategory", (v || undefined) as PropertyFormData["commercialCategory"])
                      }
                    >
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Alege" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Birou</SelectItem>
                        <SelectItem value="retail">Comercial / Retail</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="warehouse">Depozit</SelectItem>
                        <SelectItem value="other">Altul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usefulArea">Suprafață utilă *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="usefulArea"
                        type="number"
                        min={0}
                        value={formData.usefulArea || ""}
                        onChange={(e) => updateField("usefulArea", Number(e.target.value) || 0)}
                        placeholder="Introdu suprafața utilă"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        mp
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preț solicitat *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="price"
                        type="text"
                        inputMode="numeric"
                        value={formData.price > 0 ? formData.price.toLocaleString("ro-RO") : ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          updateField("price", digits ? parseInt(digits, 10) : 0);
                        }}
                        placeholder="Introdu prețul"
                        className="border-purple-200"
                      />
                      <span className="flex items-center px-3 rounded-md border border-purple-200 bg-muted/50 text-sm text-muted-foreground">
                        €
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Comision cumpărător</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formData.commissionType === "none" || !formData.commissionPercent
                          ? "0%"
                          : `${formData.commissionPercent}%`}
                      </span>
                      <div className="flex rounded-lg border border-purple-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "none");
                            updateField("commissionPercent", 0);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "none"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Nu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateField("commissionType", "custom");
                            updateField("commissionPercent", formData.commissionPercent || 2);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            formData.commissionType === "custom"
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-muted-foreground hover:bg-purple-50"
                          )}
                        >
                          Da
                        </button>
                      </div>
                      {formData.commissionType === "custom" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={formData.commissionPercent ?? ""}
                            onChange={(e) =>
                              updateField("commissionPercent", e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-16 border-purple-200 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Titlu anunț</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Titlul anunțului"
                      maxLength={65}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{formData.title.length}/65</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value || undefined)}
                      placeholder="Descriere detaliată"
                      rows={4}
                      maxLength={2500}
                      className="border-purple-200"
                    />
                    <p className="text-xs text-muted-foreground">{(formData.description || "").length}/2500</p>
                  </div>
                </div>
              ) : (
                /* Variantă completă pentru alte tipuri */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Etaj (din câte)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor || ""}
                      onChange={(e) => updateField("floor", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Etaj"
                      className="border-purple-200"
                    />
                    <Input
                      type="number"
                      value={formData.totalFloors || ""}
                      onChange={(e) => updateField("totalFloors", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="din"
                      className="border-purple-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comfort">Confort</Label>
                  <Select
                    value={formData.comfort}
                    onValueChange={(value) => updateField("comfort", value as PropertyFormData["comfort"])}
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue placeholder="— Alege —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Confort 1</SelectItem>
                      <SelectItem value="2">Confort 2</SelectItem>
                      <SelectItem value="3">Confort 3</SelectItem>
                      <SelectItem value="4">Confort 4</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usefulArea">Suprafață utilă (mp) *</Label>
                  <Input
                    id="usefulArea"
                    type="number"
                    min="0"
                    value={formData.usefulArea || ""}
                    onChange={(e) => updateField("usefulArea", Number(e.target.value) || 0)}
                    placeholder="mp"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalArea">Suprafață totală (mp)</Label>
                  <Input
                    id="totalArea"
                    type="number"
                    min="0"
                    value={formData.totalArea || ""}
                    onChange={(e) => updateField("totalArea", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mp"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balconyArea">Suprafață balcon (mp)</Label>
                  <Input
                    id="balconyArea"
                    type="number"
                    min="0"
                    value={formData.balconyArea || ""}
                    onChange={(e) => updateField("balconyArea", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mp"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terraceArea">Suprafață terasă (mp)</Label>
                  <Input
                    id="terraceArea"
                    type="number"
                    min="0"
                    value={formData.terraceArea || ""}
                    onChange={(e) => updateField("terraceArea", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mp"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yardArea">Suprafață curte (mp)</Label>
                  <Input
                    id="yardArea"
                    type="number"
                    min="0"
                    value={formData.yardArea || ""}
                    onChange={(e) => updateField("yardArea", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="mp"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Nr. camere</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="0"
                    value={formData.rooms || ""}
                    onChange={(e) => updateField("rooms", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Nr. dormitoare</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms || ""}
                    onChange={(e) => updateField("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Nr. băi</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms || ""}
                    onChange={(e) => updateField("bathrooms", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balconies">Nr. balcoane</Label>
                  <Input
                    id="balconies"
                    type="number"
                    min="0"
                    value={formData.balconies || ""}
                    onChange={(e) => updateField("balconies", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terraces">Nr. terase</Label>
                  <Input
                    id="terraces"
                    type="number"
                    min="0"
                    value={formData.terraces || ""}
                    onChange={(e) => updateField("terraces", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingSpots">Nr. locuri parcare</Label>
                  <Input
                    id="parkingSpots"
                    type="number"
                    min="0"
                    value={formData.parkingSpots || ""}
                    onChange={(e) => updateField("parkingSpots", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingType">Tipul imobilului</Label>
                  <Select
                    value={formData.buildingType}
                    onValueChange={(value) => updateField("buildingType", value as PropertyFormData["buildingType"])}
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue placeholder="— Alege —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartament</SelectItem>
                      <SelectItem value="house">Casă</SelectItem>
                      <SelectItem value="villa">Vilă</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="other">Altul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Nr. etaje imobil</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    min="0"
                    value={formData.totalFloors || ""}
                    onChange={(e) => updateField("totalFloors", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="ex: 4"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constructionYear">Anul construcției</Label>
                  <Input
                    id="constructionYear"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.constructionYear || ""}
                    onChange={(e) => updateField("constructionYear", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="ex: 2010"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heatingSystem">Sistem de încălzire</Label>
                  <Select
                    value={formData.heatingSystem}
                    onValueChange={(value) => updateField("heatingSystem", value as PropertyFormData["heatingSystem"])}
                  >
                    <SelectTrigger className="border-purple-200">
                      <SelectValue placeholder="— Alege —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central">Central</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="gas">Gaz</SelectItem>
                      <SelectItem value="wood">Lemne</SelectItem>
                      <SelectItem value="none">Fără</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heatingType">Tip încălzire</Label>
                  <Input
                    id="heatingType"
                    value={formData.heatingType || ""}
                    onChange={(e) => updateField("heatingType", e.target.value || undefined)}
                    placeholder="Detalii suplimentare"
                    className="border-purple-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAttic"
                      checked={formData.hasAttic}
                      onCheckedChange={(checked) => updateField("hasAttic", checked === true)}
                    />
                    <Label htmlFor="hasAttic" className="cursor-pointer">
                      Are mansardă
                    </Label>
                  </div>
                </div>

                {/* Câmpuri specifice pentru Apartament */}
                {(formData.type === "apartment" || formData.type === "commercial") && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasElevator"
                          checked={formData.hasElevator}
                          onCheckedChange={(checked) => updateField("hasElevator", checked === true)}
                        />
                        <Label htmlFor="hasElevator" className="cursor-pointer">
                          Are lift
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orientation">Orientare</Label>
                      <Select
                        value={formData.orientation}
                        onValueChange={(value) => updateField("orientation", value as PropertyFormData["orientation"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north">Nord</SelectItem>
                          <SelectItem value="south">Sud</SelectItem>
                          <SelectItem value="east">Est</SelectItem>
                          <SelectItem value="west">Vest</SelectItem>
                          <SelectItem value="northeast">Nord-Est</SelectItem>
                          <SelectItem value="northwest">Nord-Vest</SelectItem>
                          <SelectItem value="southeast">Sud-Est</SelectItem>
                          <SelectItem value="southwest">Sud-Vest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exposure">Expoziție</Label>
                      <Select
                        value={formData.exposure}
                        onValueChange={(value) => updateField("exposure", value as PropertyFormData["exposure"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunny">Însorit</SelectItem>
                          <SelectItem value="partial">Parțial</SelectItem>
                          <SelectItem value="shaded">Umbră</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Câmpuri specifice pentru Casă */}
                {formData.type === "house" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="roofType">Tip acoperiș</Label>
                      <Select
                        value={formData.roofType}
                        onValueChange={(value) => updateField("roofType", value as PropertyFormData["roofType"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tile">Țiglă</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="asphalt">Bitum</SelectItem>
                          <SelectItem value="other">Altul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="foundationType">Tip fundație</Label>
                      <Select
                        value={formData.foundationType}
                        onValueChange={(value) => updateField("foundationType", value as PropertyFormData["foundationType"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concrete">Beton</SelectItem>
                          <SelectItem value="strip">Fundație continuă</SelectItem>
                          <SelectItem value="slab">Placă</SelectItem>
                          <SelectItem value="other">Altul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accessRoad"
                          checked={formData.accessRoad}
                          onCheckedChange={(checked) => updateField("accessRoad", checked === true)}
                        />
                        <Label htmlFor="accessRoad" className="cursor-pointer">
                          Acces la drum asfaltat
                        </Label>
                      </div>
                    </div>
                  </>
                )}

                {/* Câmpuri specifice pentru Teren */}
                {formData.type === "land" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="landCategory">Categoria terenului</Label>
                      <Select
                        value={formData.landCategory}
                        onValueChange={(value) => updateField("landCategory", value as PropertyFormData["landCategory"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intravilan">Intravilan</SelectItem>
                          <SelectItem value="extravilan">Extravilan</SelectItem>
                          <SelectItem value="agricultural">Agricol</SelectItem>
                          <SelectItem value="forest">Forestier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utilities">Utilități disponibile</Label>
                      <Input
                        id="utilities"
                        value={formData.utilities || ""}
                        onChange={(e) => updateField("utilities", e.target.value || undefined)}
                        placeholder="ex: apă, curent, gaz"
                        className="border-purple-200"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="roadAccess"
                          checked={formData.roadAccess}
                          onCheckedChange={(checked) => updateField("roadAccess", checked === true)}
                        />
                        <Label htmlFor="roadAccess" className="cursor-pointer">
                          Acces la drum
                        </Label>
                      </div>
                    </div>
                  </>
                )}

                {/* Câmpuri specifice pentru Comercial */}
                {formData.type === "commercial" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="allowedActivity">Activitate permisă</Label>
                      <Input
                        id="allowedActivity"
                        value={formData.allowedActivity || ""}
                        onChange={(e) => updateField("allowedActivity", e.target.value || undefined)}
                        placeholder="ex: retail, birouri, restaurant"
                        className="border-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visibility">Vizibilitate</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value) => updateField("visibility", value as PropertyFormData["visibility"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Ridicată</SelectItem>
                          <SelectItem value="medium">Medie</SelectItem>
                          <SelectItem value="low">Scăzută</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footTraffic">Trafic pietonal</Label>
                      <Select
                        value={formData.footTraffic}
                        onValueChange={(value) => updateField("footTraffic", value as PropertyFormData["footTraffic"])}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="— Alege —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Ridicat</SelectItem>
                          <SelectItem value="medium">Mediu</SelectItem>
                          <SelectItem value="low">Scăzut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Câmpuri pentru Închiriere */}
                {formData.transactionType === "rent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="deposit">Garanție ({formData.priceCurrency})</Label>
                      <Input
                        id="deposit"
                        type="number"
                        min="0"
                        value={formData.deposit || ""}
                        onChange={(e) => updateField("deposit", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="ex: 500"
                        className="border-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minRentalPeriod">Perioadă minimă (luni)</Label>
                      <Input
                        id="minRentalPeriod"
                        type="number"
                        min="1"
                        value={formData.minRentalPeriod || ""}
                        onChange={(e) => updateField("minRentalPeriod", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="ex: 12"
                        className="border-purple-200"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="utilitiesIncluded"
                          checked={formData.utilitiesIncluded}
                          onCheckedChange={(checked) => updateField("utilitiesIncluded", checked === true)}
                        />
                        <Label htmlFor="utilitiesIncluded" className="cursor-pointer">
                          Utilități incluse în chirie
                        </Label>
                      </div>
                    </div>
                  </>
                )}

                {/* Câmpuri pentru Vânzare */}
                {formData.transactionType === "sale" && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="documentsReady"
                          checked={formData.documentsReady}
                          onCheckedChange={(checked) => updateField("documentsReady", checked === true)}
                        />
                        <Label htmlFor="documentsReady" className="cursor-pointer">
                          Acte gata (titlu de proprietate, certificat urbanism)
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availableFrom">Disponibil de la</Label>
                      <Input
                        id="availableFrom"
                        type="date"
                        value={formData.availableFrom ? new Date(formData.availableFrom).toISOString().split("T")[0] : ""}
                        onChange={(e) => updateField("availableFrom", e.target.value ? new Date(e.target.value) : undefined)}
                        className="border-purple-200"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mortgageAvailable"
                          checked={formData.mortgageAvailable}
                          onCheckedChange={(checked) => updateField("mortgageAvailable", checked === true)}
                        />
                        <Label htmlFor="mortgageAvailable" className="cursor-pointer">
                          Acceptă credit ipotecar
                        </Label>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Titlu (max. 65 caractere)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Titlul anunțului"
                    maxLength={65}
                    className="border-purple-200"
                  />
                  <p className="text-xs text-muted-foreground">{formData.title.length}/65</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descriere (max. 2500 caractere)</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value || undefined)}
                    placeholder="Descriere detaliată"
                    rows={6}
                    maxLength={2500}
                    className="border-purple-200"
                  />
                  <p className="text-xs text-muted-foreground">{(formData.description || "").length}/2500</p>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Step 3: Poze */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Poze</h3>
              <PropertyImageUploader
                images={formData.images || []}
                onChange={(images) => updateField("images", images)}
                maxFiles={20}
                maxSizeMB={15}
              />
            </div>
          )}

          {/* Step 4: Preț */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Preț</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <PriceInput
                    id="price"
                    label="Preț (EUR)"
                    value={formData.price || 0}
                    onChange={(v) => updateField("price", v)}
                    currency="EUR"
                    placeholder="ex: 150.000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="plusVAT"
                      checked={formData.plusVAT}
                      onCheckedChange={(checked) => updateField("plusVAT", checked === true)}
                    />
                    <Label htmlFor="plusVAT" className="cursor-pointer">
                      Plus TVA
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negotiable"
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => updateField("negotiable", checked === true)}
                    />
                    <Label htmlFor="negotiable" className="cursor-pointer">
                      Negociabil
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Comision</Label>
                  <div className="space-y-3">
                    {/* Comision Standard */}
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-700">
                          Comision Standard ({formData.transactionType === "rent" ? "Închiriere" : "Vânzare"})
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          {formData.transactionType === "rent" ? "50%" : "2%"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formData.transactionType === "rent"
                          ? "Comision standard pentru închiriere: 50% din prima chirie"
                          : "Comision standard pentru vânzare: 2% din prețul de vânzare"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commissionNone"
                        checked={formData.commissionType === "none"}
                        onCheckedChange={(checked) => {
                          updateField("commissionType", checked ? "none" : "custom");
                          if (!checked) {
                            // Revenire la standard când se bifează custom
                            updateField("commissionPercent", formData.transactionType === "rent" ? 50 : 2);
                          }
                        }}
                      />
                      <Label htmlFor="commissionNone" className="cursor-pointer">
                        Fără comision (0%)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commissionCustom"
                        checked={formData.commissionType === "custom"}
                        onCheckedChange={(checked) => {
                          updateField("commissionType", checked ? "custom" : "none");
                          if (checked) {
                            // Setează la standard când se bifează custom
                            updateField("commissionPercent", formData.transactionType === "rent" ? 50 : 2);
                          }
                        }}
                      />
                      <Label htmlFor="commissionCustom" className="cursor-pointer">
                        Personalizat
                      </Label>
                    </div>
                    {formData.commissionType === "custom" && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.commissionPercent || ""}
                          onChange={(e) => updateField("commissionPercent", e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="%"
                          className="border-purple-200 w-32"
                        />
                        <span className="text-sm text-muted-foreground">
                          {formData.transactionType === "rent" ? "(Standard: 50%)" : "(Standard: 2%)"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calcule */}
                {formData.price > 0 && (
                  <div className="md:col-span-2 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <p className="text-base font-bold mb-3 text-purple-700">Calcule</p>
                    <div className="space-y-2">
                      {formData.usefulArea > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">Preț/mp (suprafață utilă):</span>
                          <span className="text-sm font-bold text-purple-600">
                            {Math.round(formData.price / formData.usefulArea).toLocaleString("ro-RO")} {formData.priceCurrency}/mp
                          </span>
                        </div>
                      )}
                      {formData.commissionType === "custom" && formData.commissionPercent && formData.commissionPercent > 0 && (
                        <>
                          <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                            <span className="text-sm font-medium text-foreground">Comision ({formData.commissionPercent}%):</span>
                            <span className="text-sm font-bold text-green-600">
                              {Math.round((formData.price * formData.commissionPercent) / 100).toLocaleString("ro-RO")} {formData.priceCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {formData.transactionType === "rent" ? "Din prima chirie" : "Din prețul de vânzare"}
                            </span>
                          </div>
                        </>
                      )}
                      {formData.plusVAT && formData.price > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                          <span className="text-sm font-medium text-foreground">Preț cu TVA:</span>
                          <span className="text-sm font-bold text-purple-600">
                            {Math.round(formData.price * 1.19).toLocaleString("ro-RO")} {formData.priceCurrency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-purple-200">
                  <Label className="flex items-center gap-2 text-base font-semibold text-purple-700">
                    <Globe className="h-4 w-4" />
                    Publicare pe site-ul agenției
                  </Label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.showOnSite ?? false}
                        onCheckedChange={(c) => updateField("showOnSite", c === true)}
                        className="border-purple-300 data-[state=checked]:bg-purple-600"
                      />
                      <span className="text-sm font-medium">Postează pe site-ul agenției</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.featuredOnSite ?? false}
                        onCheckedChange={(c) => updateField("featuredOnSite", c === true)}
                        className="border-purple-300 data-[state=checked]:bg-purple-600"
                      />
                      <span className="text-sm font-medium">Postează pe prima pagină (secțiunea de evidență)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Salvează */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Rezumat și Salvare</h3>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm text-muted-foreground mb-4">
                  Verifică informațiile și salvează proprietatea.
                </p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Tip:</span> {formData.transactionType === "sale" ? "Vânzare" : "Închiriere"} - {formData.type === "apartment" ? "Apartament" : formData.type === "house" ? "Casă" : formData.type === "land" ? "Teren" : "Comercial"}</p>
                  {formData.title && <p><span className="font-semibold">Titlu:</span> {formData.title}</p>}
                  {formData.price > 0 && <p><span className="font-semibold">Preț:</span> {formData.price.toLocaleString("ro-RO")} {formData.priceCurrency}</p>}
                  {formData.usefulArea > 0 && <p><span className="font-semibold">Suprafață utilă:</span> {formData.usefulArea} mp</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-purple-200 hover:bg-purple-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Înapoi
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canGoNext()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
              >
                Următorul
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSave}
                disabled={!formData.type || !formData.transactionType}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvează Proprietate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
