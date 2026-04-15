import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/auth/callback"];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for MSAL session in cookies/headers
  // Note: MSAL stores tokens in sessionStorage which is not accessible in middleware.
  // We use a lightweight cookie check or rely on client-side protection.
  // For full protection, the client components check authentication state.

  // Since MSAL uses sessionStorage and middleware runs on the edge,
  // we cannot directly check MSAL auth state here.
  // The client-side components will handle the actual auth check.
  // This middleware primarily ensures the routes exist and handles any
  // server-side redirects that might be needed.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
