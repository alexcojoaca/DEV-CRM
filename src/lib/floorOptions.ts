/** Opțiuni etaje: demisol, parter, 1..21, ultimul etaj. Folosit la Client și Lead. */
export const FLOOR_OPTIONS: { value: string; label: string }[] = [
  { value: "demisol", label: "Demisol" },
  { value: "parter", label: "Parter" },
  ...Array.from({ length: 21 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
  { value: "ultimul", label: "Ultimul etaj" },
];

/** Valorile pentru „Etaj intermediar” = toate etajele 1–20 (fără demisol, parter, 21, ultimul). */
export const INTERMEDIAR_VALUES = FLOOR_OPTIONS.filter(
  (o) => o.value !== "demisol" && o.value !== "parter" && o.value !== "21" && o.value !== "ultimul"
).map((o) => o.value);

export function parsePreferredFloors(s: string | undefined): Set<string> {
  if (!s?.trim()) return new Set();
  return new Set(s.split(",").map((x) => x.trim()).filter(Boolean));
}

export function formatPreferredFloors(set: Set<string>): string | undefined {
  if (set.size === 0) return undefined;
  const order = FLOOR_OPTIONS.map((o) => o.value);
  const sorted = [...set].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return sorted.join(", ");
}
