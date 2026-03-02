"use client";

import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const DEFAULT_CENTER: [number, number] = [45.9432, 24.9668]; // România
const DEFAULT_ZOOM = 6;

function parseMapLocation(value: string | undefined): { lat: number; lng: number } | null {
  if (!value || typeof value !== "string") return null;
  const parts = value.trim().split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
  }
  return null;
}

function createPinIcon() {
  return L.divIcon({
    className: "custom-pin",
    html: `<div style="
      width: 32px; height: 32px; margin-left: -16px; margin-top: -32px;
      background: linear-gradient(135deg, #9333ea 0%, #db2777 100%);
      border: 2px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

interface MapClickHandlerProps {
  onPosition: (lat: number, lng: number) => void;
}

function MapClickHandler({ onPosition }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPosition(lat, lng);
    },
  });
  return null;
}

interface MapPinPickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  height?: number;
}

export function MapPinPicker({ value, onChange, className = "", height = 280 }: MapPinPickerProps) {
  const [mounted, setMounted] = useState(false);
  const parsed = parseMapLocation(value);
  const [position, setPosition] = useState<[number, number] | null>(parsed ? [parsed.lat, parsed.lng] : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const p = parseMapLocation(value);
    setPosition(p ? [p.lat, p.lng] : null);
  }, [value]);

  const handlePosition = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);
      onChange(`${lat.toFixed(6)},${lng.toFixed(6)}`);
    },
    [onChange]
  );

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-purple-200 bg-muted/30 text-muted-foreground ${className}`}
        style={{ height }}
      >
        Se încarcă harta…
      </div>
    );
  }

  const center: [number, number] = position ?? DEFAULT_CENTER;
  const zoom = position ? 17 : DEFAULT_ZOOM;

  return (
    <div className={`overflow-hidden rounded-lg border border-purple-200 ${className}`} style={{ height }}>
      <MapContainer
        key={`${center[0]}-${center[1]}-${zoom}`}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom
        style={{ height: "100%", minHeight: height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPosition={handlePosition} />
        {position && (
          <Marker position={position} icon={createPinIcon()} />
        )}
      </MapContainer>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Apasă pe hartă pentru a plasa pinul. Coordonate: {position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "—"}
      </p>
    </div>
  );
}
