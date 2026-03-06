/**
 * Store pentru prezentări, keyed by property ID.
 * Linkul nu expiră; se șterge doar când se șterge proprietatea.
 * Persistență pe disc ca datele să supraviețuiască restartului serverului.
 */

import path from "path";
import fs from "fs";

export type PresentationProperty = Record<string, unknown>;

const store = new Map<string, PresentationProperty>();

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "prezentare-store.json");

let loaded = false;
let fsAvailable: boolean | null = null;

function canUseFs(): boolean {
  if (fsAvailable !== null) return fsAvailable;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const testPath = path.join(DATA_DIR, ".prezentare-store-test");
    fs.writeFileSync(testPath, "ok", "utf-8");
    fs.unlinkSync(testPath);
    fsAvailable = true;
  } catch (e) {
    console.warn(
      "prezentare-store: filesystem not available; falling back to in-memory store only. Links may not survive server restarts or serverless cold starts.",
      e
    );
    fsAvailable = false;
  }
  return fsAvailable;
}

function loadFromFile(): void {
  if (loaded) return;
  loaded = true;
  if (!canUseFs()) return;
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    const obj = JSON.parse(raw) as Record<string, PresentationProperty>;
    for (const [id, data] of Object.entries(obj)) {
      if (id && data && typeof data === "object") store.set(id, data);
    }
  } catch {
    // Fișier inexistent sau invalid – store rămâne gol
  }
}

function saveToFile(): void {
  if (!canUseFs()) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const obj = Object.fromEntries(store);
    fs.writeFileSync(FILE_PATH, JSON.stringify(obj), "utf-8");
  } catch (e) {
    console.error("prezentare-store: save failed", e);
  }
}

export function savePresentationById(id: string, data: PresentationProperty): void {
  if (!id) return;
  loadFromFile();
  store.set(id, data);
  saveToFile();
}

export function getPresentation(id: string): PresentationProperty | null {
  if (!id) return null;
  loadFromFile();
  return store.get(id) ?? null;
}

export function deletePresentation(id: string): boolean {
  if (!id) return false;
  loadFromFile();
  const ok = store.delete(id);
  if (ok) saveToFile();
  return ok;
}
