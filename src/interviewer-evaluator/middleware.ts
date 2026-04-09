import { NextRequest, NextResponse } from "next/server";

/**
 * Public routes that do not require authentication.
 * All other routes redirect to /login when the auth session cookie is absent.
 */
const PUBLIC_PATHS: string[] = ["/login", "/auth/callback"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  /**
   * The auth-session cookie is a non-sensitive presence flag set by
   * /auth/callback after MSAL successfully exchanges the authorization code
   * for tokens. It signals to the middleware that the user has authenticated.
   *
   * The actual tokens live in sessionStorage (managed by MSAL) and are never
   * stored in a cookie. This cookie only carries the flag value "1".
   */
  const authSessionCookie = request.cookies.get("auth-session");

  if (!authSessionCookie?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the originally requested route so /auth/callback can redirect back
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
