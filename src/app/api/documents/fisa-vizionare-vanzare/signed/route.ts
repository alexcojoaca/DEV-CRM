import { NextResponse } from "next/server";
import { listSessionsByUser } from "@/lib/signing-sessions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "";
    const sort = searchParams.get("sort") ?? "date"; // date | client
    if (!userId) {
      return NextResponse.json(
        { error: "userId este obligatoriu." },
        { status: 400 }
      );
    }
    let list = await listSessionsByUser(userId);
    list = list.filter((s) => s.status === "signed");
    if (sort === "client") {
      list = [...list].sort((a, b) =>
        (a.clientData?.nume ?? "").localeCompare(b.clientData?.nume ?? "")
      );
    }
    return NextResponse.json({
      items: list.map((s) => ({
        token: s.token,
        createdAt: s.createdAt,
        signedAt: s.signedAt,
        clientName: s.clientData?.nume ?? "—",
        propertyAddress: s.agentData.adresa_publica || s.agentData.adresa_completa || "—",
        tipImobil: s.agentData.tip_imobil ?? "—",
      })),
    });
  } catch (e) {
    console.error("Signed list error:", e);
    return NextResponse.json(
      { error: "Eroare la listare." },
      { status: 500 }
    );
  }
}
