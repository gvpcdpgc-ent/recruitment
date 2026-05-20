import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting (Note: This will reset on serverless function restart)
// For true production, Upstash Redis is recommended.
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const now = Date.now();
  const limit = 60; // 60 requests per minute
  const windowMs = 60 * 1000;

  // Rate Limiting Logic
  const rateData = rateLimitMap.get(ip);
  if (!rateData || now > rateData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    rateData.count++;
    if (rateData.count > limit) {
      return new NextResponse('Too many requests', { status: 429 });
    }
  }

  const response = NextResponse.next();
  
  // Security Headers (Redundant but good practice)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/api/applications/submit',
    '/api/admin/:path*',
  ],
};
