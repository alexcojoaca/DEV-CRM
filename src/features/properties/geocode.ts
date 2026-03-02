/**
 * Geocodare adresă cu Nominatim (OpenStreetMap). Fără erori către utilizator dacă nu găsește.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
}

/** Rezultat geocodare cu detalii adresă (pentru completare automată) */
export interface GeocodeResultWithAddress extends GeocodeResult {
  displayName?: string;
  street?: string;
  number?: string;
  zone?: string;
  county?: string;
}

/**
 * Construiește query din stradă, număr, județ, zonă (opțional).
 * Returnează null dacă nu e suficient pentru căutare.
 */
export function buildAddressQuery(parts: {
  street?: string;
  number?: string;
  county?: string;
  zone?: string;
}): string | null {
  const { street, number, county, zone } = parts;
  const hasStreet = street?.trim();
  const hasCounty = county?.trim();
  if (!hasStreet && !hasCounty) return null;
  const bits: string[] = [];
  if (hasStreet) bits.push(number?.trim() ? `${hasStreet} ${number.trim()}` : hasStreet);
  if (zone?.trim()) bits.push(zone.trim());
  if (hasCounty) bits.push(county!.trim());
  bits.push("România");
  return bits.join(", ") || null;
}

/**
 * Geocodează o adresă. Returnează { lat, lng } sau null. Nu aruncă erori.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const full = await geocodeAddressFull(query);
  return full ? { lat: full.lat, lng: full.lng } : null;
}

/**
 * Geocodează o adresă și returnează coordonate + detalii adresă pentru completare automată.
 * Caută în România (countrycodes=ro) pentru rezultate mai relevante.
 */
export async function geocodeAddressFull(query: string): Promise<GeocodeResultWithAddress | null> {
  if (!query.trim()) return null;
  const q = query.trim().endsWith(", România") ? query.trim() : `${query.trim()}, România`;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "ro");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "RealEstateCRM/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    const addr = first.address;
    const street = addr?.road ?? addr?.street ?? addr?.pedestrian;
    const number = addr?.house_number;
    const zone = addr?.suburb ?? addr?.neighbourhood ?? addr?.quarter ?? addr?.borough;
    const county = addr?.city ?? addr?.town ?? addr?.municipality ?? addr?.state;
    return {
      lat,
      lng,
      displayName: first.display_name,
      street: street || undefined,
      number: number || undefined,
      zone: zone || undefined,
      county: county || undefined,
    };
  } catch {
    return null;
  }
}
