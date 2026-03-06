import { join } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { randomBytes } from "crypto";

export interface ExtensionImportPayload {
  id?: string;
  portal: string;
  portalName: string;
  sourceUrl: string;
  title: string;
  description: string;
  price: number;
  ownerPhone: string;
  characteristics: string[];
  images: { data: string; name: string }[];
  createdAt?: string;
}

const FILENAME = "extension-imports.json";
const DATA_DIR = join(process.cwd(), ".data");
const FILE_PATH = join(DATA_DIR, FILENAME);

let fsAvailable: boolean | null = null;

function canUseFs(): boolean {
  if (fsAvailable !== null) return fsAvailable;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const testPath = join(DATA_DIR, ".extension-imports-test");
    writeFileSync(testPath, "ok", "utf-8");
    // best-effort cleanup
    try {
      // eslint-disable-next-line no-empty
      require("fs").unlinkSync(testPath);
    } catch {}
    fsAvailable = true;
  } catch (e) {
    console.warn(
      "extension-imports-store: filesystem not available; falling back to in-memory store only. Imported items may not survive server restarts or serverless cold starts.",
      e
    );
    fsAvailable = false;
  }
  return fsAvailable;
}

function ensureDir() {
  if (typeof process === "undefined") return;
  if (!canUseFs()) return;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

const memoryStore: ExtensionImportPayload[] = [];

function loadAll(): ExtensionImportPayload[] {
  if (!canUseFs()) {
    return [...memoryStore];
  }
  try {
    ensureDir();
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, "utf-8");
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }
  } catch (_) {}
  return [];
}

function saveAll(items: ExtensionImportPayload[]) {
  if (!canUseFs()) {
    // keep only in-memory copy
    memoryStore.splice(0, memoryStore.length, ...items);
    return;
  }
  try {
    ensureDir();
    writeFileSync(FILE_PATH, JSON.stringify(items, null, 0), "utf-8");
  } catch (_) {}
}

export function addImport(payload: Omit<ExtensionImportPayload, "id" | "createdAt">): ExtensionImportPayload {
  const id = `imp_${Date.now()}_${randomBytes(4).toString("hex")}`;
  const item: ExtensionImportPayload = {
    ...payload,
    id,
    createdAt: new Date().toISOString(),
  };
  const all = loadAll();
  all.unshift(item);
  saveAll(all);
  return item;
}

export function getImport(id: string): ExtensionImportPayload | null {
  const all = loadAll();
  return all.find((i) => i.id === id) ?? null;
}

export function getAllImports(): ExtensionImportPayload[] {
  return loadAll();
}

export function deleteImport(id: string): boolean {
  const all = loadAll();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  saveAll(all);
  return true;
}
