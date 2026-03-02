/**
 * Sesiuni de semnare la distanță — Fișă vizionare ÎNCHIRIERE.
 * Același API ca signing-sessions, cu AgentViewingData adaptat pentru închiriere.
 */

import { readFile, writeFile, mkdir, readdir, rm } from "fs/promises";
import path from "path";

const BASE = path.join(process.cwd(), "data", "signing-sessions-inchiriere");

export interface AgentViewingDataInchiriere {
  data_vizionarii: string;
  ora_vizionarii: string;
  tip_imobil: string;
  adresa_completa: string;
  adresa_publica: string;
  comision_procent: string;
  comision_termen_plata_zile: string;
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
  signature_visitor_dataurl?: string;
}

export interface SignatureMeta {
  signed_at: string;
  timezone: string;
  ip: string;
}

export interface SessionMetaInchiriere {
  token: string;
  createdBy: string;
  createdAt: string;
  status: "pending" | "signed";
  signedAt?: string;
  agentData: AgentViewingDataInchiriere;
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
  agentData: AgentViewingDataInchiriere,
  agentSignatureMeta?: SignatureMeta
): Promise<void> {
  await ensureDir();
  const dir = tokenPath(token);
  await mkdir(dir, { recursive: true });
  const meta: SessionMetaInchiriere = {
    token,
    createdBy,
    createdAt: new Date().toISOString(),
    status: "pending",
    agentData,
    agentSignatureMeta,
  };
  await writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");
}

export async function getSession(token: string): Promise<SessionMetaInchiriere | null> {
  try {
    const dir = tokenPath(token);
    const raw = await readFile(path.join(dir, "meta.json"), "utf-8");
    return JSON.parse(raw) as SessionMetaInchiriere;
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
  const meta = JSON.parse(metaRaw) as SessionMetaInchiriere;
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

export async function deleteSession(token: string): Promise<boolean> {
  try {
    const dir = tokenPath(token);
    await rm(dir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function listSessionsByUser(userId: string): Promise<SessionMetaInchiriere[]> {
  await ensureDir();
  const entries = await readdir(BASE, { withFileTypes: true });
  const sessions: SessionMetaInchiriere[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const meta = await getSession(e.name);
    if (meta && meta.createdBy === userId) sessions.push(meta);
  }
  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
