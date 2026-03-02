import { BUCHAREST_ZONES } from "@/features/properties/bucharestZones";

export const COUNTIES = [
  "București", "Cluj", "Timiș", "Constanța", "Dolj", "Iași", "Brașov", "Argeș", "Mureș", "Arad",
  "Alba", "Bihor", "Bacău", "Bistrița-Năsăud", "Botoșani", "Brăila", "Buzău", "Caraș-Severin",
  "Călărași", "Covasna", "Dâmbovița", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
  "Ialomița", "Maramureș", "Mehedinți", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
  "Sibiu", "Suceava", "Teleorman", "Tulcea", "Vâlcea", "Vaslui", "Vrancea",
];

const DEFAULT_ZONES = ["Centru", "Nord", "Sud", "Est", "Vest"];

export function getZonesForCounty(county: string): string[] {
  if (county === "București") return [...BUCHAREST_ZONES];
  return DEFAULT_ZONES;
}
