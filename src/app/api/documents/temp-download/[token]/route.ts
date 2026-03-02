import { NextResponse } from "next/server";
import { getAndRemove } from "@/lib/pdf-temp-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const entry = await getAndRemove(token);
    if (!entry) {
      return NextResponse.json(
        { error: "Link invalid sau expirat." },
        { status: 404 }
      );
    }
    const filename = entry.filename;
    return new NextResponse(entry.bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("Temp download error:", e);
    return NextResponse.json(
      { error: "Eroare la descărcare." },
      { status: 500 }
    );
  }
}
