// src/callback/handler.ts
import { NextResponse } from "next/server";
var EG_SESSION_COOKIE = "eg_session";
var EG_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
async function handleAuthCallback(request, config) {
  const { searchParams, origin } = new URL(request.url);
  const egToken = searchParams.get("eg_token");
  const next = searchParams.get("next") ?? "/";
  if (!egToken) {
    return NextResponse.redirect(new URL("/", origin));
  }
  try {
    const verifyRes = await fetch(`${config.ssoUrl}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({ token: egToken })
    });
    if (!verifyRes.ok) {
      throw new Error("eg_token verify failed");
    }
    const { eg_session } = await verifyRes.json();
    const response = NextResponse.redirect(new URL(next, origin));
    response.cookies.set(EG_SESSION_COOKIE, eg_session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EG_SESSION_MAX_AGE
    });
    return response;
  } catch (err) {
    console.error("[auth callback error]", err);
    const loginUrl = `${config.ssoUrl}/auth/login`;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(
      `${loginUrl}?redirect_to=${encodeURIComponent(redirectTo)}`
    );
  }
}

// src/callback/route.ts
function createCallbackRoute(config) {
  return async function GET(request) {
    return handleAuthCallback(request, config);
  };
}

// src/signout/handler.ts
import { cookies } from "next/headers";
import { NextResponse as NextResponse2 } from "next/server";
async function handleSignout() {
  const cookieStore = await cookies();
  cookieStore.set("eg_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return NextResponse2.json({ success: true });
}
function createSignoutRoute() {
  return async function POST() {
    return handleSignout();
  };
}

// src/middleware/updateSession.ts
import { NextResponse as NextResponse3 } from "next/server";
var EG_SESSION_COOKIE2 = "eg_session";
function updateSession(request) {
  const egSession = request.cookies.get(EG_SESSION_COOKIE2)?.value;
  if (!egSession) {
    const loginUrl = new URL(
      "/auth/login",
      process.env.NEXT_PUBLIC_SSO_URL
    );
    loginUrl.searchParams.set(
      "redirect_to",
      request.nextUrl.href
    );
    return NextResponse3.redirect(loginUrl);
  }
  return NextResponse3.next();
}
var defaultMatcherConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
export {
  createCallbackRoute,
  createSignoutRoute,
  defaultMatcherConfig,
  handleAuthCallback,
  handleSignout,
  updateSession
};
//# sourceMappingURL=server.mjs.map