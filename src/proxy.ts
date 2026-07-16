import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TIMEOUT_MS = 30 * 60 * 1000;
const CUSTOMER_TIMEOUT_MS = 4 * 60 * 60 * 1000;

// testing time
// const ADMIN_TIMEOUT_MS = 30 * 1000;      // 30 seconds
// const CUSTOMER_TIMEOUT_MS = 30 * 1000;   // 30 seconds

function addSecurityHeaders(res: NextResponse): NextResponse {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.firebaseio.com https://apis.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.paypal.com https://api.afterpay.com https://api-sandbox.afterpay.com https://firebasestorage.googleapis.com",
    "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");

  const headers: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy": csp,
  };

  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }

  return res;
}

export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === "true") {
    if (request.nextUrl.pathname.startsWith("/maintenance")) {
      const res = NextResponse.next();
      res.headers.set("x-maintenance", "1");
      return res;
    }
    if (request.cookies.get("admin")?.value !== "true") {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  }

  const sessionCookie = request.cookies.get("__session")?.value;
  const lastActivity = request.cookies.get("lastActivityAt")?.value;

  if (!sessionCookie) {
    return addSecurityHeaders(NextResponse.next());
  }

  const now = Date.now();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const timeout = isAdminRoute ? ADMIN_TIMEOUT_MS : CUSTOMER_TIMEOUT_MS;

  if (!lastActivity) {
    const res = NextResponse.next();
    res.cookies.set("lastActivityAt", now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return addSecurityHeaders(res);
  }

  const lastActivityTime = parseInt(lastActivity, 10);
  if (Number.isNaN(lastActivityTime)) {
    const res = NextResponse.next();
    res.cookies.set("lastActivityAt", now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return addSecurityHeaders(res);
  }

  if (now - lastActivityTime > timeout) {
    const loginUrl = isAdminRoute ? "/admin/login" : "/login";
    const res = NextResponse.redirect(new URL(loginUrl, request.url));
    res.cookies.set("__session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    res.cookies.set("lastActivityAt", "", {
      path: "/",
      maxAge: 0,
    });
    return addSecurityHeaders(res);
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|api/|robots.txt|sitemap.xml|.*\\.svg|.*\\.png|.*\\.html).*)",
  ],
};
