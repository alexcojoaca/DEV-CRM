"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/features/properties/propertyTypes";

interface PropertyImageUploaderProps {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

const DEFAULT_MAX = 20;
const DEFAULT_MAX_MB = 15;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Redimensionează și comprimă imaginea ca JPEG pentru a evita depășirea localStorage pe telefon */
function compressDataUrl(dataUrl: string, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        if (w > h) {
          h = Math.round((h * MAX_DIMENSION) / w);
          w = MAX_DIMENSION;
        } else {
          w = Math.round((w * MAX_DIMENSION) / h);
          h = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => reject(new Error("Imagine invalidă."));
    img.src = dataUrl;
  });
}

/** Pe mobil unele fișiere (cameră) au type gol – acceptăm și după extensie */
function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (!file.type && /\.(jpe?g|png|webp|heic|gif)$/i.test(file.name)) return true;
  return false;
}

export function PropertyImageUploader({
  images,
  onChange,
  maxFiles = DEFAULT_MAX,
  maxSizeMB = DEFAULT_MAX_MB,
  className,
}: PropertyImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const readFile = useCallback(
    async (file: File): Promise<PropertyImage> => {
      if (!isImageFile(file)) {
        throw new Error("Doar imagini sunt acceptate.");
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Max ${maxSizeMB} MB per fișier.`);
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Citire eșuată."));
        reader.readAsDataURL(file);
      });
      let finalData = dataUrl;
      if (dataUrl.length > 1_500_000) {
        finalData = await compressDataUrl(dataUrl, file.name);
      }
      return { data: finalData, name: file.name };
    },
    [maxSizeMB]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      setLoading(true);
      const remaining = maxFiles - images.length;
      if (remaining <= 0) {
        setError(`Maxim ${maxFiles} poze.`);
        setLoading(false);
        return;
      }
      const toAdd = Array.from(files).slice(0, remaining);
      try {
        const newImages = await Promise.all(toAdd.map(readFile));
        onChange([...images, ...newImages]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Eroare la încărcare.");
      } finally {
        setLoading(false);
      }
    },
    [images, maxFiles, readFile, onChange]
  );

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const onDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null) return;
    if (draggedIndex !== toIndex) move(draggedIndex, toIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onTouchStart = (index: number) => setDraggedIndex(index);
  const onTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      move(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = target?.closest("[data-image-index]");
    const idx = item ? Number((item as HTMLElement).dataset.imageIndex) : null;
    if (typeof idx === "number" && idx !== draggedIndex) setDragOverIndex(idx);
  };

  const inputId = "property-image-upload-input";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input off-screen (nu display:none) ca pe iOS tap pe label să deschidă picker-ul */}
      <div className="relative h-0 w-0 overflow-hidden">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="absolute left-0 top-0 w-px h-px"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          aria-label="Adaugă poze"
        />
      </div>
      <label
        htmlFor={inputId}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/30 py-8 transition-colors hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer min-h-[120px]"
      >
        <ImagePlus className="h-10 w-10 text-purple-500" />
        <span className="text-sm font-medium text-foreground">
          {loading ? "Se încarcă…" : "Adaugă poze"}
        </span>
        <span className="text-xs text-muted-foreground">
          sau trage fișierele aici (max {maxFiles}, {maxSizeMB} MB/fișier)
        </span>
      </label>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Prima poză = copertă. Trage pentru a reordona (mouse sau deget).
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <li
                key={`${img.name}-${index}`}
                data-image-index={index}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDrop(e, index)}
                onTouchStart={() => onTouchStart(index)}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchMove}
                onTouchCancel={onTouchEnd}
                className={cn(
                  "relative group rounded-lg overflow-hidden border-2 bg-muted transition-all",
                  draggedIndex === index && "opacity-50 scale-95 z-10",
                  dragOverIndex === index && "ring-2 ring-purple-500 ring-offset-2"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url || img.data}
                  alt={img.name}
                  className="aspect-square w-full object-cover pointer-events-none"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                    Copertă
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    className="rounded p-1 bg-white/90 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
                    title="Trage pentru a reordona"
                  >
                    <GripVertical className="h-5 w-5" />
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded p-1 bg-white/90 text-destructive hover:bg-destructive hover:text-white transition-colors"
                    title="Șterge"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nicio poză încărcată. Prima poză adăugată va fi coperta anunțului.
        </p>
      )}
    </div>
  );
}
