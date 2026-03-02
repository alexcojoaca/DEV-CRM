import { NextResponse } from "next/server";
import {
  createToken,
  saveSession,
  type AgentViewingData,
} from "@/lib/signing-sessions";

export const dynamic = "force-dynamic";

function getBaseUrl(request: Request): string {
  const u = new URL(request.url);
  return `${u.protocol}//${u.host}`;
}

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "—";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = (body.userId ?? "").toString().trim() || "anonymous";
    const agentData: AgentViewingData = {
      data_vizionarii: body.data_vizionarii ?? "",
      ora_vizionarii: body.ora_vizionarii ?? "",
      tip_imobil: body.tip_imobil ?? "",
      adresa_completa: body.adresa_completa ?? "",
      adresa_publica: body.adresa_publica ?? "",
      comision_procent: body.comision_procent ?? "",
      agency_denumire: body.agency_denumire ?? "",
      agency_sediu: body.agency_sediu ?? "",
      agency_nr_orc: body.agency_nr_orc ?? "",
      agency_cui: body.agency_cui ?? "",
      agency_iban: body.agency_iban ?? "",
      agency_banca: body.agency_banca ?? "",
      agency_reprezentat_prin: body.agency_reprezentat_prin ?? "",
      agency_functia: body.agency_functia ?? "",
      agent_name: body.agent_name ?? "",
    };

    const token = createToken();
    const now = new Date();
    const agentSignatureMeta = {
      signed_at: now.toISOString(),
      timezone: "Europe/Bucharest",
      ip: getClientIp(request) || "—",
    };
    await saveSession(token, userId, agentData, agentSignatureMeta);

    const base = getBaseUrl(request);
    const link = `${base}/s/v/${token}`;

    return NextResponse.json({
      ok: true,
      token,
      link,
    });
  } catch (e) {
    console.error("Remote create error:", e);
    return NextResponse.json(
      { ok: false, error: "Eroare la crearea linkului." },
      { status: 500 }
    );
  }
}
