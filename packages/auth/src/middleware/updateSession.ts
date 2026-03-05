import { NextResponse, type NextRequest } from 'next/server';

const EG_SESSION_COOKIE = "eg_session";

export function updateSession(request: NextRequest) {

  const egSession = request.cookies.get(EG_SESSION_COOKIE)?.value;

  if (!egSession) {

    const loginUrl = new URL(
      "/auth/login",
      process.env.NEXT_PUBLIC_SSO_URL
    );

    loginUrl.searchParams.set(
      "redirect_to",
      request.nextUrl.href
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const defaultMatcherConfig = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
