import { NextResponse } from "next/server";
import { getAllImports } from "@/lib/extension-imports-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = getAllImports();
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json(
      { error: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
