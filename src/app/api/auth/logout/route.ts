import { NextResponse } from "next/server";
import { getSessionCookieConfig } from "@/features/auth/session";

export async function POST() {
  const config = getSessionCookieConfig(0);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    ...config,
    maxAge: 0,
    value: "",
  });
  return res;
}
