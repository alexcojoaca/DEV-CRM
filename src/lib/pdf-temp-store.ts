/**
 * Store temporar pentru PDF-uri (pe disc), pentru descărcare forțată pe iOS.
 * Token-urile expiră după un TTL configurabil. Funcționează între request-uri (același server sau același filesystem).
 */

import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const BASE = process.env.PDF_TEMP_DOWNLOAD_DIR
  ? path.resolve(process.env.PDF_TEMP_DOWNLOAD_DIR)
  : path.join(process.cwd(), "data", "temp-downloads");

// TTL configurabil (în milisecunde) prin env PDF_TEMP_DOWNLOAD_TTL_MS; default 2 minute.
const DEFAULT_TTL_MS = 2 * 60 * 1000;
const TTL_MS = (() => {
  const raw = process.env.PDF_TEMP_DOWNLOAD_TTL_MS;
  if (!raw) return DEFAULT_TTL_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
})();

const TOKEN_LENGTH = 32;

function randomToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(TOKEN_LENGTH);
  let t = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    t += chars[bytes[i] % chars.length];
  }
  return t;
}

function safeToken(t: string): string {
  return t.replace(/[^A-Za-z0-9_-]/g, "");
}

async function ensureDir(): Promise<void> {
  await mkdir(BASE, { recursive: true });
}

export async function createDownloadToken(bytes: Uint8Array, filename: string): Promise<string> {
  const token = randomToken();
  await ensureDir();
  const safe = safeToken(token);
  const pdfPath = path.join(BASE, `${safe}.pdf`);
  const metaPath = path.join(BASE, `${safe}.meta`);
  await writeFile(pdfPath, Buffer.from(bytes), "binary");
  await writeFile(metaPath, JSON.stringify({ filename, createdAt: Date.now() }), "utf-8");
  return token;
}

export async function getAndRemove(
  token: string
): Promise<{ bytes: Uint8Array; filename: string } | null> {
  try {
    const safe = safeToken(token);
    if (!safe) return null;
    const metaPath = path.join(BASE, `${safe}.meta`);
    const metaRaw = await readFile(metaPath, "utf-8");
    const meta = JSON.parse(metaRaw) as { filename: string; createdAt: number };
    if (Date.now() - meta.createdAt > TTL_MS) {
      await unlink(metaPath).catch(() => {});
      await unlink(path.join(BASE, `${safe}.pdf`)).catch(() => {});
      return null;
    }
    const pdfPath = path.join(BASE, `${safe}.pdf`);
    const bytes = await readFile(pdfPath);
    await unlink(metaPath).catch(() => {});
    await unlink(pdfPath).catch(() => {});
    return { bytes: new Uint8Array(bytes), filename: meta.filename };
  } catch {
    return null;
  }
}
