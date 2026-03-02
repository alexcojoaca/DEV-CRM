import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { getSession, getPdfPath } from "@/lib/signing-sessions-inchiriere";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ error: "Document negăsit." }, { status: 404 });
    }
    if (session.status !== "signed") {
      return NextResponse.json(
        { error: "Documentul nu a fost încă semnat." },
        { status: 400 }
      );
    }
    const userId = request.nextUrl.searchParams.get("userId");
    if (userId && session.createdBy !== userId) {
      return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
    }
    const pdfPath = await getPdfPath(token);
    if (!pdfPath) {
      return NextResponse.json({ error: "PDF negăsit." }, { status: 404 });
    }
    const buf = await readFile(pdfPath);
    const view = request.nextUrl.searchParams.get("view") === "1";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": view
          ? 'inline; filename="fisa-vizionare-inchiriere-semnata.pdf"'
          : 'attachment; filename="fisa-vizionare-inchiriere-semnata.pdf"',
      },
    });
  } catch (e) {
    console.error("Signed PDF inchiriere download error:", e);
    return NextResponse.json(
      { error: "Eroare la descărcare." },
      { status: 500 }
    );
  }
}
