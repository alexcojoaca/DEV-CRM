"use client";

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
import type { ViewingFormData, ViewingStatus, ViewingType } from "@/features/viewings/viewingTypes";
import { VIEWING_STATUS_OPTIONS, VIEWING_TYPE_OPTIONS } from "@/features/viewings/viewingTypes";
import type { Property } from "@/features/properties/propertyTypes";
import type { Client } from "@/features/clients/clientTypes";

interface ViewingFormProps {
  data: ViewingFormData;
  onChange: (data: ViewingFormData) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  properties: Property[];
  clients: Client[];
}

function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = new Date(d);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocal(s: string): Date | undefined {
  if (!s) return undefined;
  return new Date(s);
}

function getPropertyAddress(p: Property): string {
  const parts = [p.street?.trim(), p.number?.trim(), p.zone?.trim(), p.county?.trim()].filter(Boolean);
  return parts.join(", ") || "";
}

export function ViewingForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Salvează",
  properties,
  clients,
}: ViewingFormProps) {
  const update = <K extends keyof ViewingFormData>(k: K, v: ViewingFormData[K]) => {
    onChange({ ...data, [k]: v });
  };

  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : new Date();
  const dateTimeLocal = toDateTimeLocal(scheduledAt);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <div className="space-y-2">
        <Label>Tip vizionare</Label>
        <Select
          value={data.viewingType ?? ""}
          onValueChange={(v) => update("viewingType", (v as ViewingType) || undefined)}
        >
          <SelectTrigger className="border-purple-200">
            <SelectValue placeholder="Vânzare sau Închiriere" />
          </SelectTrigger>
          <SelectContent>
            {VIEWING_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyId">Proprietate</Label>
        <Select
          value={data.propertyId ?? ""}
          onValueChange={(v) => {
            const id = v || undefined;
            const prop = id ? properties.find((p) => p.id === id) : null;
            if (prop) {
              onChange({
                ...data,
                propertyId: id,
                address: data.address || getPropertyAddress(prop),
                ownerName: data.ownerName || prop.ownerName || "",
                ownerPhone: data.ownerPhone || prop.ownerPhone || "",
              });
            } else {
              update("propertyId", id);
            }
          }}
        >
          <SelectTrigger className="border-purple-200" id="propertyId">
            <SelectValue placeholder="Alege din listă (opțional)" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title} {p.zone ? `(${p.zone})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="sau introdu manual: denumire/adresă proprietate"
          value={data.propertyNameFree ?? ""}
          onChange={(e) => update("propertyNameFree", e.target.value || undefined)}
          className="border-purple-200 mt-1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresă vizionare</Label>
        <Input
          id="address"
          placeholder="Strada, număr, zona, județ (se completează automat din proprietate)"
          value={data.address ?? ""}
          onChange={(e) => update("address", e.target.value || undefined)}
          className="border-purple-200"
        />
      </div>

      <div className="space-y-2">
        <Label>Proprietar</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Nume proprietar"
            value={data.ownerName ?? ""}
            onChange={(e) => update("ownerName", e.target.value || undefined)}
            className="border-purple-200"
          />
          <Input
            placeholder="Telefon proprietar"
            value={data.ownerPhone ?? ""}
            onChange={(e) => update("ownerPhone", e.target.value || undefined)}
            className="border-purple-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client</Label>
        <Select
          value={data.clientId ?? ""}
          onValueChange={(v) => {
            const id = v || undefined;
            const c = id ? clients.find((x) => x.id === id) : null;
            onChange({
              ...data,
              clientId: id,
              clientPhoneFree: c?.phone ?? data.clientPhoneFree,
            });
          }}
        >
          <SelectTrigger className="border-purple-200" id="clientId">
            <SelectValue placeholder="Alege din listă (opțional)" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} {c.phone ? `– ${c.phone}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="sau introdu manual: nume client"
          value={data.clientNameFree ?? ""}
          onChange={(e) => update("clientNameFree", e.target.value || undefined)}
          className="border-purple-200 mt-1"
        />
        <Input
          placeholder="Telefon client"
          value={data.clientPhoneFree ?? ""}
          onChange={(e) => update("clientPhoneFree", e.target.value || undefined)}
          className="border-purple-200 mt-1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Data și ora</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={dateTimeLocal}
          onChange={(e) => update("scheduledAt", fromDateTimeLocal(e.target.value))}
          className="border-purple-200"
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={data.status}
          onValueChange={(v) => update("status", (v as ViewingStatus) || "scheduled")}
        >
          <SelectTrigger className="border-purple-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIEWING_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea
          id="notes"
          value={data.notes ?? ""}
          onChange={(e) => update("notes", e.target.value || undefined)}
          placeholder="Note vizionare"
          rows={4}
          className="border-purple-200"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-purple-100 pt-4">
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="border-purple-200">
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}
