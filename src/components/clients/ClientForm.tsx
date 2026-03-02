"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceInput } from "@/components/properties/PriceInput";
import { ClientZonesMultiSelect } from "@/components/clients/ClientZonesMultiSelect";
import { CountyCombobox } from "@/components/clients/CountyCombobox";
import {
  TRANSACTION_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
} from "@/features/clients/clientTypes";
import type { Client, ClientFormData } from "@/features/clients/clientTypes";
import { COUNTIES, getZonesForCounty } from "@/features/clients/clientLocations";

interface ClientFormProps {
  client?: Client | null;
  initialData?: Partial<ClientFormData>;
  onSave: (data: ClientFormData) => void;
  onCancel: () => void;
}

const defaultFormData: ClientFormData = {
  transactionType: "sale",
  propertyType: "apartment",
  name: "",
  phone: "",
  county: undefined,
  zone: undefined,
  roomsMin: undefined,
  roomsMax: undefined,
  budgetMin: undefined,
  budgetMax: undefined,
  constructionYearMin: undefined,
  status: "potential",
  source: "portal",
  notes: undefined,
};

export function ClientForm({
  client,
  initialData,
  onSave,
  onCancel,
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    ...defaultFormData,
    ...(client
      ? {
          transactionType: client.transactionType,
          propertyType: client.propertyType ?? "apartment",
          name: client.name,
          phone: client.phone,
          county: client.county,
          zone: client.zone,
          roomsMin: client.roomsMin,
          roomsMax: client.roomsMax,
          budgetMin: client.budgetMin,
          budgetMax: client.budgetMax,
          constructionYearMin: client.constructionYearMin,
          status: client.status,
          source: client.source,
          notes: client.notes,
        }
      : {}),
    ...initialData,
  });

  const zoneOptions = formData.county ? getZonesForCounty(formData.county) : [];
  const [selectedZones, setSelectedZones] = useState<string[]>(() => {
    const initialZone = initialData?.zone ?? client?.zone;
    if (!initialZone) return [];
    return initialZone
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean);
  });

  const update = (updates: Partial<ClientFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      if (updates.county !== undefined && updates.county !== prev.county) {
        next.zone = undefined;
        setSelectedZones([]);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ClientFormData = {
      ...formData,
      zone: selectedZones.length ? selectedZones.join(", ") : undefined,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tip tranzacție</Label>
          <Select
            value={formData.transactionType}
            onValueChange={(v) => update({ transactionType: v as ClientFormData["transactionType"] })}
          >
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tip imobil</Label>
          <Select
            value={formData.propertyType}
            onValueChange={(v) =>
              update({ propertyType: v as ClientFormData["propertyType"] })
            }
          >
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nume</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Nume client"
            className="border-purple-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Nr. telefon</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="07xx xxx xxx"
            className="border-purple-200"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Județ</Label>
          <CountyCombobox
            value={formData.county ?? ""}
            options={COUNTIES}
            onChange={(v) => update({ county: v || undefined })}
            placeholder="— Alege județ —"
          />
        </div>
        <div className="space-y-2">
          <Label>Zonă</Label>
          <ClientZonesMultiSelect
            value={selectedZones}
            options={zoneOptions}
            onChange={setSelectedZones}
            placeholder="— Alege una sau mai multe zone —"
          />
        </div>
      </div>

      {formData.propertyType === "land" ||
      formData.propertyType === "commercial" ||
      formData.propertyType === "industrial" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="surfaceMin">Suprafață minimă (mp)</Label>
            <Input
              id="surfaceMin"
              type="number"
              min={0}
              value={formData.surfaceMin ?? ""}
              onChange={(e) =>
                update({
                  surfaceMin:
                    e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                })
              }
              placeholder="ex: 300"
              className="border-purple-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surfaceMax">Suprafață maximă (mp)</Label>
            <Input
              id="surfaceMax"
              type="number"
              min={0}
              value={formData.surfaceMax ?? ""}
              onChange={(e) =>
                update({
                  surfaceMax:
                    e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                })
              }
              placeholder="ex: 1.000"
              className="border-purple-200"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="roomsMin">Nr. camere minim</Label>
            <Input
              id="roomsMin"
              type="number"
              min={0}
              value={formData.roomsMin ?? ""}
              onChange={(e) =>
                update({
                  roomsMin:
                    e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                })
              }
              placeholder="ex: 2"
              className="border-purple-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomsMax">Nr. camere maxim</Label>
            <Input
              id="roomsMax"
              type="number"
              min={0}
              value={formData.roomsMax ?? ""}
              onChange={(e) =>
                update({
                  roomsMax:
                    e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                })
              }
              placeholder="ex: 4"
              className="border-purple-200"
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <PriceInput
          id="budgetMin"
          label="Buget minim"
          value={formData.budgetMin ?? 0}
          onChange={(v) => update({ budgetMin: v || undefined })}
          placeholder="ex: 50.000"
          currency="EUR"
        />
        <PriceInput
          id="budgetMax"
          label="Buget maxim"
          value={formData.budgetMax ?? 0}
          onChange={(v) => update({ budgetMax: v || undefined })}
          placeholder="ex: 100.000"
          currency="EUR"
        />
      </div>

      {formData.propertyType !== "land" && (
        <div className="space-y-2">
          <Label htmlFor="constructionYearMin">An minim construcție</Label>
          <Input
            id="constructionYearMin"
            type="number"
            min={1900}
            max={2100}
            value={formData.constructionYearMin ?? ""}
            onChange={(e) =>
              update({
                constructionYearMin:
                  e.target.value === "" ? undefined : parseInt(e.target.value, 10),
              })
            }
            placeholder="ex: 2000"
            className="border-purple-200 max-w-[180px]"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Stare</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => update({ status: v as ClientFormData["status"] })}
          >
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sursă</Label>
          <Select
            value={formData.source}
            onValueChange={(v) => update({ source: v as ClientFormData["source"] })}
          >
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea
          id="notes"
          value={formData.notes ?? ""}
          onChange={(e) => update({ notes: e.target.value || undefined })}
          placeholder="Note despre client..."
          className="border-purple-200 min-h-[80px]"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          Salvează
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Anulare
        </Button>
      </div>
    </form>
  );
}
