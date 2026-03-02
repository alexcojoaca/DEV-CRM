import { NextResponse } from "next/server";
import { getPresentation, deletePresentation } from "@/lib/prezentare-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Lipsește id-ul." }, { status: 400 });
  }
  const data = getPresentation(token);
  if (!data) {
    return NextResponse.json({ error: "Prezentare inexistentă sau proprietatea a fost ștearsă." }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Lipsește id-ul." }, { status: 400 });
  }
  deletePresentation(token);
  return NextResponse.json({ ok: true });
}
