import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, COOKIE_NAME } from "@/features/auth/session";

const APP_PREFIX = "/app";
const ONBOARDING_PREFIX = "/onboarding";
const PROTECTED_PREFIXES = [
  "/app",
  "/dashboard",
  "/leads",
  "/clients",
  "/deals",
  "/matches",
  "/properties",
  "/viewings",
  "/tasks",
  "/documents",
  "/team",
  "/reports",
  "/settings",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/prezentare") && !pathname.startsWith("/api/documents")) return false;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/prezentare/") || pathname.startsWith("/s/") || pathname.startsWith("/p/")) return true;
  if (pathname === "/auth/login" || pathname === "/auth/register") return true;
  if (pathname.startsWith("/onboarding")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await decodeSession(token);
  if (!session) {
    const res = NextResponse.redirect(new URL("/auth/login", request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  if (session.memberships.length === 0 && !pathname.startsWith(ONBOARDING_PREFIX)) {
    return NextResponse.redirect(new URL("/onboarding/create-workspace", request.url));
  }

  if (session.memberships.length > 0 && !session.activeWorkspaceId) {
    if (pathname === "/app/select-workspace") return NextResponse.next();
    return NextResponse.redirect(new URL("/app/select-workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/onboarding/:path*",
    "/auth/login",
    "/auth/register",
    "/dashboard/:path*",
    "/leads/:path*",
    "/clients/:path*",
    "/deals/:path*",
    "/matches/:path*",
    "/properties/:path*",
    "/viewings/:path*",
    "/tasks/:path*",
    "/documents/:path*",
    "/team/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
