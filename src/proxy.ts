import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

// Basic in-memory rate limiting
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const now = Date.now();

  // 1. Rate Limiting Logic for API routes
  if (pathname.startsWith("/api")) {
    const rateData = rateLimitMap.get(ip);
    const limit = 60; 
    const windowMs = 60 * 1000;

    if (!rateData || now > rateData.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      rateData.count++;
      if (rateData.count > limit) {
        return new NextResponse('Too many requests', { status: 429 });
      }
    }
  }

  // 2. Auth Protection Logic
  if (pathname.startsWith("/gvp-admin") && !pathname.startsWith("/gvp-admin/login")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/gvp-admin/login", request.url));
    }

    try {
      const payload = await decrypt(sessionCookie);
      if (!payload || !payload.adminId) {
        return NextResponse.redirect(new URL("/gvp-admin/login", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/gvp-admin/login", request.url));
    }
  }

  const response = NextResponse.next();
  
  // 3. Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    "/gvp-admin/:path*",
    "/api/applications/submit",
    "/api/admin/:path*"
  ],
};
