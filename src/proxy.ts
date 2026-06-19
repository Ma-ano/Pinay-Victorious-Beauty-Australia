import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

const protectedRoutes = ["/profile", "/admin", "/orders"];
const authRoutes = ["/login", "/register", "/admin/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("__session")?.value;

  const isAdminLogin = pathname.startsWith("/admin/login");
  const isProtected = !isAdminLogin && protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    if (!session) {
      const loginUrl = new URL(isAdminLogin ? "/admin/login" : "/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const auth = getAdminAuth();
      const claims = await auth.verifySessionCookie(session);
      if (!claims.email_verified) {
        return NextResponse.redirect(new URL(isAdminLogin ? "/admin/login" : "/verify-email", request.url));
      }
      if (pathname.startsWith("/admin") && !claims.isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      const loginUrl = new URL(isAdminLogin ? "/admin/login" : "/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthRoute && session) {
    try {
      const auth = getAdminAuth();
      await auth.verifySessionCookie(session);
      return NextResponse.redirect(new URL(isAdminLogin ? "/admin" : "/", request.url));
    } catch {
      // Session invalid — allow access to auth routes
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/orders/:path*", "/login", "/register"],
};
