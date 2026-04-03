import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value ??
    req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login";
  const isProtectedRoute =
    pathname === "/" || pathname.startsWith("/attendances");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/attendances/:path*", "/login"],
};
