import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Date invalide", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password, fullName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Acest email este deja înregistrat." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName: fullName?.trim() || null,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Eroare necunoscută";
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
    console.error("Register error:", e);
    if (message.includes("connect") || message.includes("ECONNREFUSED") || message.includes("P1001")) {
      return NextResponse.json(
        { error: "Nu se poate conecta la baza de date. Verifică că baza de date rulează și că DATABASE_URL este corect în .env." },
        { status: 503 }
      );
    }
    if (code === "P2002") {
      return NextResponse.json({ error: "Acest email este deja înregistrat." }, { status: 409 });
    }
    if (code === "P2021" || message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Tabelele lipsesc în baza de date. Rulează: npx prisma db push" },
        { status: 503 }
      );
    }
    const safeMessage =
      process.env.NODE_ENV === "development" ? message : "Înregistrarea a eșuat. Încearcă din nou.";
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
