import { NextResponse } from "next/server";
import { getSession, deleteSession } from "@/lib/signing-sessions-inchiriere";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ error: "Document negăsit." }, { status: 404 });
    }
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId || session.createdBy !== userId) {
      return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
    }
    const ok = await deleteSession(token);
    if (!ok) {
      return NextResponse.json({ error: "Eroare la ștergere." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete signed inchiriere error:", e);
    return NextResponse.json(
      { error: "Eroare la ștergere." },
      { status: 500 }
    );
  }
}
