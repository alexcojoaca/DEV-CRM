import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AppSession } from "./types";

const COOKIE_NAME = "app_session";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function encodeSession(session: AppSession, maxAge: number = DEFAULT_MAX_AGE): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(secret);
}

export async function decodeSession(token: string): Promise<AppSession | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AppSession;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function getSessionCookieConfig(maxAge: number = DEFAULT_MAX_AGE) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export { COOKIE_NAME };
