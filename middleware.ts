import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.amazonaws.com https://*.supabase.co https://*.googleusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://us.i.posthog.com https://*.amazonaws.com https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicit favicon handling - ensure it serves from public directory
  if (pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Skip middleware for static files only
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // This catches .js, .css, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Skip for known static routes
  const staticRoutes = [
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json'
  ];

  if (staticRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Apply security headers to all responses
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};