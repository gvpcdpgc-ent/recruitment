import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /gvp-admin routes, except login
  if (pathname.startsWith("/gvp-admin") && !pathname.startsWith("/gvp-admin/login")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/gvp-admin/login", request.url));
    }

    try {
      const payload = await decrypt(sessionCookie);
      
      // Basic 30m rolling session check if needed, but jose handles expiration
      if (!payload || !payload.adminId) {
        return NextResponse.redirect(new URL("/gvp-admin/login", request.url));
      }
      
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL("/gvp-admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gvp-admin/:path*"],
};
