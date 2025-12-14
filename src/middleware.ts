import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi'
});

export default function middleware(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isHttp = forwardedProto === 'http' || request.nextUrl.protocol === 'http:';
  const hostname = request.nextUrl.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isHttp && !isLocal) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};  