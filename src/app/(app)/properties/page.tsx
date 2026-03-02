"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFormStepper } from "@/components/properties/PropertyFormStepper";
import { PropertyViewDialog } from "@/components/properties/PropertyViewDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Home, Search, Filter } from "lucide-react";
import {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
} from "@/features/properties/propertyMockData";
import type { Property, PropertyFormData, PropertyImage } from "@/features/properties/propertyTypes";

/** Convertește data URL (base64) în File pentru upload. */
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bstr = atob(arr[1] ?? "");
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename || "image.jpg", { type: mime });
}

/** Încarcă în bucket (Supabase/local) doar imaginile cu .data (base64). */
async function uploadPropertyImages(propertyId: string, images: PropertyImage[]): Promise<void> {
  const toUpload = images.filter(
    (img): img is PropertyImage & { data: string } =>
      !!img.data && typeof img.data === "string" && img.data.startsWith("data:")
  );
  for (const img of toUpload) {
    const file = dataURLtoFile(img.data, img.name || "image.jpg");
    const form = new FormData();
    form.set("file", file);
    form.set("entityType", "LISTING");
    form.set("entityId", propertyId);
    form.set("kind", "IMAGE");
    const res = await fetch("/api/files/upload", { method: "POST", body: form, credentials: "include" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Upload eșuat");
    }
  }
}

/** Normalizează răspunsul API (createdAt/updatedAt string) la tipul Property (Date). */
function fromApiProperty(p: { createdAt?: string; updatedAt?: string; [key: string]: unknown }): Property {
  return {
    ...p,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  } as Property;
}
import { getClientById } from "@/features/clients/clientMockData";
import { useSession } from "@/features/session/useSession";

export default function PropertiesPage() {
  const { user, organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ userId: string; fullName: string | null; email: string }[]>([]);
  const [portfolioMemberId, setPortfolioMemberId] = useState<string | null>(null); // null = Al meu
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const currentRole = user?.role ?? "AGENT";
  const canSeeOtherPortfolios = currentRole === "OWNER" || currentRole === "MANAGER";

  const clientIdFromUrl = searchParams.get("clientId");
  const viewIdFromUrl = searchParams.get("viewId");
  const matchClient = clientIdFromUrl ? getClientById(workspaceId, clientIdFromUrl) : null;

  useEffect(() => {
    if (workspaceId && canSeeOtherPortfolios) {
      fetch("/api/team/list")
        .then((r) => r.json())
        .then((data) => {
          if (data.members) setTeamMembers(data.members);
        })
        .catch(() => setTeamMembers([]));
    } else {
      setTeamMembers([]);
    }
  }, [workspaceId, canSeeOtherPortfolios]);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    filterProperties();
  }, [filterProperties]);

  useEffect(() => {
    if (viewIdFromUrl && properties.length > 0) {
      const prop = properties.find((p) => p.id === viewIdFromUrl);
      if (prop) {
        setSelectedProperty(prop);
        setIsViewOpen(true);
      }
    }
  }, [viewIdFromUrl, properties]);

  const loadProperties = useCallback(async () => {
    if (workspaceId) {
      try {
        const createdBy = portfolioMemberId ?? user?.id ?? "";
        const url = createdBy ? `/api/properties?createdBy=${encodeURIComponent(createdBy)}` : "/api/properties";
        const res = await fetch(url);
        if (!res.ok) {
          setProperties([]);
          return;
        }
        const list = (await res.json()) as Array<{ createdAt?: string; updatedAt?: string; [key: string]: unknown }>;
        setProperties(list.map(fromApiProperty));
        list.forEach((p) => {
          const payload = { ...p, createdAt: p.createdAt ?? new Date().toISOString(), updatedAt: p.updatedAt ?? new Date().toISOString() };
          fetch("/api/prezentare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
        });
      } catch {
        setProperties([]);
      }
      return;
    }
    const list = getProperties(workspaceId);
    setProperties([...list]);
    list.forEach((p) => {
      const payload = { ...p, createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt, updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt };
      fetch("/api/prezentare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
    });
  }, [workspaceId, portfolioMemberId, user?.id]);

  const filterProperties = useCallback(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.address && p.address.toLowerCase().includes(query)) ||
          (p.city && p.city.toLowerCase().includes(query)) ||
          (p.street && p.street.toLowerCase().includes(query)) ||
          (p.county && p.county.toLowerCase().includes(query)) ||
          (p.zone && p.zone.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    // Client match filter: when opened from "Potrivește proprietăți", filter by client zones/budget/rooms
    if (matchClient) {
      const clientZones = matchClient.zones ?? matchClient.qualification?.preferredZones ?? [];
      const budgetMin = matchClient.budgetMin;
      const budgetMax = matchClient.budgetMax ?? matchClient.qualification?.budgetMax;
      const roomsMin = matchClient.roomsMin ?? matchClient.qualification?.minRooms;
      if (clientZones.length > 0) {
        filtered = filtered.filter((p) => p.zone && clientZones.some((z) => z.toLowerCase() === (p.zone ?? "").toLowerCase()));
      }
      if (budgetMin != null || budgetMax != null) {
        filtered = filtered.filter((p) => {
          const price = p.price ?? 0;
          if (budgetMin != null && price < budgetMin) return false;
          if (budgetMax != null && price > budgetMax) return false;
          return true;
        });
      }
      if (roomsMin != null) {
        filtered = filtered.filter((p) => (p.rooms ?? p.bedrooms ?? 0) >= roomsMin);
      }
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, statusFilter, typeFilter, matchClient]);

  const handleAdd = () => {
    setSelectedProperty(null);
    setIsFormOpen(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsFormOpen(true);
  };

  const handleView = (property: Property) => {
    setSelectedProperty(property);
    setIsViewOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    if (workspaceId) {
      try {
        const res = await fetch(`/api/properties/${deleteId}`, { method: "DELETE" });
        if (res.ok) loadProperties();
      } catch {
        // keep dialog open on error
      }
    } else {
      deleteProperty(workspaceId, deleteId);
      loadProperties();
    }
    setDeleteId(null);
  };

  const handleSave = async (data: PropertyFormData) => {
    const propertyData: PropertyFormData = {
      ...data,
      address: data.street && data.number ? `${data.street} ${data.number}` : data.address || "",
      city: data.city || data.county || "",
    };
    const imagesToUpload = propertyData.images ?? [];
    const { images: _omit, ...bodyWithoutImages } = propertyData as PropertyFormData & { images?: PropertyImage[] };

    if (workspaceId) {
      try {
        if (selectedProperty) {
          const res = await fetch(`/api/properties/${selectedProperty.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyWithoutImages),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert((err as { error?: string }).error || "Eroare la actualizare.");
            return;
          }
          await uploadPropertyImages(selectedProperty.id, imagesToUpload);
        } else {
          const res = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bodyWithoutImages,
              agentId: user?.id || "",
              agentName: user?.name || "",
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert((err as { error?: string }).error || "Eroare la salvare.");
            return;
          }
          const created = (await res.json()) as { id: string };
          await uploadPropertyImages(created.id, imagesToUpload);
        }
        await loadProperties();
        setIsFormOpen(false);
        setSelectedProperty(null);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Eroare la salvare. Încearcă din nou.");
      }
      return;
    }

    if (selectedProperty) {
      updateProperty(workspaceId, selectedProperty.id, propertyData);
    } else {
      addProperty(workspaceId, {
        ...propertyData,
        agentId: user?.id || "",
        agentName: user?.name || "",
      });
    }
    loadProperties();
    setIsFormOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proprietăți"
        subtitle="Gestionează lista ta de proprietăți"
        action={
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Proprietate
          </Button>
        }
      />

      {matchClient && (
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm text-purple-800">
          <span className="font-medium">Proprietăți potrivite pentru {matchClient.name}</span>
          {(matchClient.zones?.length ?? 0) > 0 && (
            <span className="ml-1 text-purple-600">
              (zone: {matchClient.zones?.join(", ") ?? ""})
            </span>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border-2 border-purple-200/50 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/10">
        {(canSeeOtherPortfolios && teamMembers.length > 0) && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Portofoliu:</span>
            <Select
              value={portfolioMemberId ?? "__mine__"}
              onValueChange={(v) => setPortfolioMemberId(v === "__mine__" ? null : v)}
            >
              <SelectTrigger className="w-[200px] border-purple-200">
                <SelectValue placeholder="Al meu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__mine__">Al meu</SelectItem>
                {teamMembers
                  .filter((m) => m.userId !== user?.id)
                  .map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.fullName || m.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după titlu, adresă sau oraș..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-purple-200 focus:border-purple-500"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] border-purple-200">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate Statusurile</SelectItem>
              <SelectItem value="available">Disponibil</SelectItem>
              <SelectItem value="reserved">Rezervat</SelectItem>
              <SelectItem value="pending">În proces</SelectItem>
              <SelectItem value="sold">Vândut</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] border-purple-200">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate Tipurile</SelectItem>
              <SelectItem value="apartment">Apartament</SelectItem>
              <SelectItem value="house">Casă</SelectItem>
              <SelectItem value="land">Teren</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listă proprietăți – pe mobil card vertical, de la sm card pe lung; ultima adăugată prima */}
      {filteredProperties.length > 0 ? (
        <div className="space-y-4">
          {[...filteredProperties]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              workspaceId={workspaceId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={properties.length === 0 ? "Nu ai proprietăți încă" : "Nu s-au găsit proprietăți"}
          description={
            properties.length === 0
              ? "Adaugă proprietăți în listă pentru a le afișa clienților."
              : "Încearcă să modifici filtrele de căutare."
          }
          action={
            properties.length === 0
              ? {
                  label: "Adaugă Prima Proprietate",
                  onClick: handleAdd,
                }
              : undefined
          }
          icon={<Home className="h-12 w-12" />}
        />
      )}

      {/* Property Form Dialog */}
      <PropertyFormStepper
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        property={selectedProperty}
        onSave={handleSave}
      />

      {/* Property View Dialog */}
      <PropertyViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        property={selectedProperty}
        workspaceId={workspaceId}
        onSaveProperty={workspaceId ? async (id, updates) => {
          const res = await fetch(`/api/properties/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
          if (!res.ok) return null;
          const json = await res.json();
          return fromApiProperty(json);
        } : undefined}
        onPropertyUpdated={(p) => {
          setSelectedProperty(p);
          loadProperties();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-purple-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Confirmă Ștergerea
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi această proprietate? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-200 hover:bg-purple-50">
              Anulează
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
