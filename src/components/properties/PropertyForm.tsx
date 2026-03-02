// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
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
import type { Property, PropertyFormData } from "@/features/properties/propertyTypes";

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
  onSave: (data: PropertyFormData) => void;
}

export function PropertyForm({ open, onOpenChange, property, onSave }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    address: "",
    city: "",
    price: 0,
    type: "apartment",
    bedrooms: undefined,
    bathrooms: undefined,
    area: 0,
    status: "available",
    description: "",
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        address: property.address,
        city: property.city,
        price: property.price,
        type: property.type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        status: property.status,
        description: property.description || "",
      });
    } else {
      setFormData({
        title: "",
        address: "",
        city: "",
        price: 0,
        type: "apartment",
        bedrooms: undefined,
        bathrooms: undefined,
        area: 0,
        status: "available",
        description: "",
      });
    }
  }, [property, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-purple-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl">
            {property ? "Editează Proprietate" : "Adaugă Proprietate Nouă"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completează informațiile despre proprietate
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titlu *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tip Proprietate *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Property["type"]) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-500">
                  <SelectValue />
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
              <Label htmlFor="address">Adresă *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Oraș *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preț (EUR) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Suprafață (mp) *</Label>
              <Input
                id="area"
                type="number"
                min="0"
                value={formData.area || ""}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            {(formData.type === "apartment" || formData.type === "house") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Număr Camere</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bedrooms: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Număr Băi</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bathrooms: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Property["status"]) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponibil</SelectItem>
                  <SelectItem value="reserved">Rezervat</SelectItem>
                  <SelectItem value="pending">În proces</SelectItem>
                  <SelectItem value="sold">Vândut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="border-purple-200 focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-purple-200 hover:bg-purple-50"
            >
              Anulează
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
            >
              {property ? "Salvează Modificările" : "Adaugă Proprietate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
