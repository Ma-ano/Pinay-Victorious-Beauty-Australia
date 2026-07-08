import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TIMEOUT_MS = 30 * 60 * 1000;
const CUSTOMER_TIMEOUT_MS = 4 * 60 * 60 * 1000;

// testing time
// const ADMIN_TIMEOUT_MS = 30 * 1000;      // 30 seconds
// const CUSTOMER_TIMEOUT_MS = 30 * 1000;   // 30 seconds

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  const lastActivity = request.cookies.get("lastActivityAt")?.value;

  if (!sessionCookie) {
    return NextResponse.next();
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
    return res;
  }

  const lastActivityTime = parseInt(lastActivity, 10);
  if (Number.isNaN(lastActivityTime)) {
    const res = NextResponse.next();
    res.cookies.set("lastActivityAt", now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return res;
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
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|api/|login|register|admin/login).*)",
  ],
};
