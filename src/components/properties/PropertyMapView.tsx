"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const DEFAULT_CENTER: [number, number] = [45.9432, 24.9668];
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

interface PropertyMapViewProps {
  mapLocation?: string;
  className?: string;
  height?: number;
}

export function PropertyMapView({ mapLocation, className = "", height = 240 }: PropertyMapViewProps) {
  const [mapReady, setMapReady] = useState(false);
  const parsed = parseMapLocation(mapLocation);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!mapReady) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-purple-200 bg-muted/30 text-muted-foreground ${className}`}
        style={{ height }}
      >
        Se încarcă harta…
      </div>
    );
  }

  const position: [number, number] = parsed ? [parsed.lat, parsed.lng] : DEFAULT_CENTER;
  const zoom = parsed ? 17 : DEFAULT_ZOOM;

  return (
    <div className={`overflow-hidden rounded-lg border border-purple-200 ${className}`} style={{ height, minHeight: height, width: "100%" }}>
      <MapContainer
        key={`${position[0]}-${position[1]}`}
        center={position}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom
        style={{ height: "100%", minHeight: height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parsed && <Marker position={[parsed.lat, parsed.lng]} icon={createPinIcon()} />}
      </MapContainer>
    </div>
  );
}
