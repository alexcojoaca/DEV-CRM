import { NextResponse } from "next/server";
import { savePresentationById } from "@/lib/prezentare-store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CONTACT_KEYS = ["ownerName", "ownerPhone", "ownerEmail"];

function sanitizeForPresentation(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (CONTACT_KEYS.includes(k)) continue;
    if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = sanitizeForPresentation(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) {
      return NextResponse.json({ error: "Lipsește id-ul proprietății." }, { status: 400 });
    }
    const sanitized = sanitizeForPresentation(body);
    savePresentationById(id, sanitized);
    const origin = request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host")}`
      : request.headers.get("origin") || "http://localhost:3000";
    const url = `${origin}/prezentare/${id}`;
    return NextResponse.json({ url, id });
  } catch (e) {
    console.error("Prezentare sync error:", e);
    return NextResponse.json(
      { error: "Nu s-a putut sincroniza prezentarea." },
      { status: 500 }
    );
  }
}
