import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const forceLogin = url.searchParams.get("forceLogin") === "1";
  
  // Combine all possible token names
  const token = req.cookies.get("token")?.value || 
                req.cookies.get("access_token")?.value ||
                req.cookies.get("session")?.value;
                
  const pathname = url.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith('/forgot-password');
  const isPublicAsset = pathname.startsWith('/_next') || 
                        pathname.includes('.') || 
                        pathname.startsWith('/api');

  // Handle Force Login (Clear Cookies)
  if (isAuthPage && forceLogin) {
    const response = NextResponse.next();
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("session", "", { maxAge: 0, path: "/" });
    return response;
  }

  // 1. If authenticated and trying to access login -> redirect to home
  if (token && isAuthPage && !forceLogin) {
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 2. If not authenticated and trying to access protected page -> redirect to login
  if (!token && !isAuthPage && !isPublicAsset) {
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Updated matcher to cover all relevant routes while excluding internals
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
