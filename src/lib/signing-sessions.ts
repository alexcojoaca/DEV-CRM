/**
 * Stocare sesiuni de semnare la distanță (fișă vizionare).
 * Folosește sistemul de fișiere; pentru producție poți înlocui cu DB.
 */

import { readFile, writeFile, mkdir, readdir, rm } from "fs/promises";
import path from "path";

const BASE = path.join(process.cwd(), "data", "signing-sessions");

export interface AgentViewingData {
  data_vizionarii: string;
  ora_vizionarii: string;
  tip_imobil: string;
  adresa_completa: string;
  adresa_publica: string;
  comision_procent: string;
  agency_denumire?: string;
  agency_sediu?: string;
  agency_nr_orc?: string;
  agency_cui?: string;
  agency_iban?: string;
  agency_banca?: string;
  agency_reprezentat_prin?: string;
  agency_functia?: string;
  agent_name?: string;
}

export interface ClientSignData {
  nume: string;
  telefon: string;
  email: string;
  ci_serie?: string;
  ci_numar?: string;
  /** Semnătură trasată (imagine) sau gol pentru semnătură digitală (doar IP + dată) */
  signature_visitor_dataurl?: string;
}

export interface SignatureMeta {
  signed_at: string; // ISO
  timezone: string;
  ip: string;
}

export interface SessionMeta {
  token: string;
  createdBy: string;
  createdAt: string;
  status: "pending" | "signed";
  signedAt?: string;
  agentData: AgentViewingData;
  /** La semnare la distanță: IP + data/ora când agentul a apăsat „Generează link” */
  agentSignatureMeta?: SignatureMeta;
  clientData?: ClientSignData;
  signatureMeta?: SignatureMeta;
}

async function ensureDir() {
  await mkdir(BASE, { recursive: true });
}

function tokenPath(token: string) {
  const safe = token.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(BASE, safe);
}

export function createToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let t = "";
  for (let i = 0; i < 32; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

export async function saveSession(
  token: string,
  createdBy: string,
  agentData: AgentViewingData,
  agentSignatureMeta?: SignatureMeta
): Promise<void> {
  await ensureDir();
  const dir = tokenPath(token);
  await mkdir(dir, { recursive: true });
  const meta: SessionMeta = {
    token,
    createdBy,
    createdAt: new Date().toISOString(),
    status: "pending",
    agentData,
    agentSignatureMeta,
  };
  await writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");
}

export async function getSession(token: string): Promise<SessionMeta | null> {
  try {
    const dir = tokenPath(token);
    const raw = await readFile(path.join(dir, "meta.json"), "utf-8");
    return JSON.parse(raw) as SessionMeta;
  } catch {
    return null;
  }
}

export async function markSigned(
  token: string,
  clientData: ClientSignData,
  signatureMeta: SignatureMeta,
  pdfBytes: Uint8Array
): Promise<void> {
  const dir = tokenPath(token);
  const metaPath = path.join(dir, "meta.json");
  const metaRaw = await readFile(metaPath, "utf-8");
  const meta = JSON.parse(metaRaw) as SessionMeta;
  if (meta.status === "signed") throw new Error("Already signed");
  meta.status = "signed";
  meta.signedAt = signatureMeta.signed_at;
  meta.clientData = clientData;
  meta.signatureMeta = signatureMeta;
  await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");
  await writeFile(path.join(dir, "document.pdf"), Buffer.from(pdfBytes));
}

export async function getPdfPath(token: string): Promise<string | null> {
  const dir = tokenPath(token);
  const pdfPath = path.join(dir, "document.pdf");
  try {
    await readFile(pdfPath);
    return pdfPath;
  } catch {
    return null;
  }
}

/** Șterge definitiv sesiunea (meta + PDF). Util pentru „Șterge document” din documente semnate. */
export async function deleteSession(token: string): Promise<boolean> {
  try {
    const dir = tokenPath(token);
    await rm(dir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function listSessionsByUser(userId: string): Promise<SessionMeta[]> {
  await ensureDir();
  const entries = await readdir(BASE, { withFileTypes: true });
  const sessions: SessionMeta[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const meta = await getSession(e.name);
    if (meta && meta.createdBy === userId) sessions.push(meta);
  }
  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
