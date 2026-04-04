import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const forceLogin = url.searchParams.get("forceLogin") === "1";
  const token = req.cookies.get("token")?.value || req.cookies.get("access_token")?.value;
  const pathname = url.pathname;

  const isAuthPage = pathname === "/login";
  const isProtectedRoute = pathname === "/" || pathname.startsWith("/attendances");

  if (!token && isProtectedRoute) {
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && forceLogin) {
    const response = NextResponse.next();

    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    response.cookies.set("access_token", "", { maxAge: 0, path: "/" });

    return response;
  }

  if (token && isAuthPage && !forceLogin) {
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/attendances/:path*", "/login"],
};
