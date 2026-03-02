import type { SitePalette } from "./siteConfig";

export interface PaletteTip {
  title: string;
  description: string;
  example: string;
}

export interface PresetPalette {
  id: string;
  name: string;
  description: string;
  palette: SitePalette;
}

/** 5 palete premium de designer, stiluri diverse */
export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: "midnight",
    name: "Midnight Elite",
    description: "Gri antracit și auriu. Lux și autoritate.",
    palette: { primary: "#0f172a", secondary: "#1e293b", accent: "#c9a227" },
  },
  {
    id: "navy",
    name: "Navy Trust",
    description: "Albastru marin și coral. Seriozitate și calditate.",
    palette: { primary: "#0c2340", secondary: "#1e3a5f", accent: "#e07c5a" },
  },
  {
    id: "forest",
    name: "Forest Premium",
    description: "Verde închis și crem. Natură și rafinament.",
    palette: { primary: "#1b4332", secondary: "#2d6a4f", accent: "#f4e4bc" },
  },
  {
    id: "charcoal",
    name: "Charcoal & Gold",
    description: "Gri cărbune cu accente aurii. Clasic premium.",
    palette: { primary: "#212529", secondary: "#495057", accent: "#d4a853" },
  },
  {
    id: "slate",
    name: "Slate Modern",
    description: "Slate și turcoaz. Modern, proaspăt.",
    palette: { primary: "#334155", secondary: "#475569", accent: "#0d9488" },
  },
];

export const PALETTE_TIPS: PaletteTip[] = [
  { title: "Culori calde (maro, bej, auriu)", description: "Transmit încredere și profesionalism.", example: "Primary: #78350f, Secondary: #a16207, Accent: #d97706" },
  { title: "Albastru și gri", description: "Inspiră seriozitate și calm.", example: "Primary: #1e3a5f, Secondary: #475569, Accent: #0ea5e9" },
  { title: "Verde și slate", description: "Natură și liniște.", example: "Primary: #14532d, Secondary: #334155, Accent: #22c55e" },
  { title: "Violet discret", description: "Modern și memorabil.", example: "Primary: #4c1d95, Secondary: #5b21b6, Accent: #8b5cf6" },
];

export const COLOR_MEANINGS: { role: string; tip: string }[] = [
  { role: "Culoare primară", tip: "Folosită pentru logo, titluri și butoane principale. Alege o nuanță care reprezintă brandul." },
  { role: "Culoare secundară", tip: "Complementează prima. Folosită pentru subtitluri, bare și fundaluri discrete." },
  { role: "Culoare de accent", tip: "Pentru link-uri, butoane de acțiune (Sună, Contact) și elemente pe care vrei să atragă atenția." },
];
