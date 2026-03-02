import { NextResponse } from "next/server";
import { addImport } from "@/lib/extension-imports-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      portal: body.portal ?? "unknown",
      portalName: body.portalName ?? "",
      sourceUrl: body.sourceUrl ?? "",
      title: body.title ?? "Anunț importat",
      description: body.description ?? "",
      price: typeof body.price === "number" ? body.price : 0,
      ownerPhone: body.ownerPhone ?? "",
      characteristics: Array.isArray(body.characteristics) ? body.characteristics : [],
      images: Array.isArray(body.images) ? body.images : [],
    };
    const item = addImport(payload);
    return NextResponse.json({ id: item.id, ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
