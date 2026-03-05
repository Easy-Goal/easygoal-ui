"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  createCallbackRoute: () => createCallbackRoute,
  createSignoutRoute: () => createSignoutRoute,
  defaultMatcherConfig: () => defaultMatcherConfig,
  handleAuthCallback: () => handleAuthCallback,
  handleSignout: () => handleSignout,
  updateSession: () => updateSession
});
module.exports = __toCommonJS(server_exports);

// src/callback/handler.ts
var import_server = require("next/server");
var EG_SESSION_COOKIE = "eg_session";
var EG_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
async function handleAuthCallback(request, config) {
  const { searchParams, origin } = new URL(request.url);
  const egToken = searchParams.get("eg_token");
  const next = searchParams.get("next") ?? "/";
  if (!egToken) {
    return import_server.NextResponse.redirect(new URL("/", origin));
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
    const response = import_server.NextResponse.redirect(new URL(next, origin));
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
    return import_server.NextResponse.redirect(
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
var import_headers = require("next/headers");
var import_server2 = require("next/server");
async function handleSignout() {
  const cookieStore = await (0, import_headers.cookies)();
  cookieStore.set("eg_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return import_server2.NextResponse.json({ success: true });
}
function createSignoutRoute() {
  return async function POST() {
    return handleSignout();
  };
}

// src/middleware/updateSession.ts
var import_server3 = require("next/server");
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
    return import_server3.NextResponse.redirect(loginUrl);
  }
  return import_server3.NextResponse.next();
}
var defaultMatcherConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
//# sourceMappingURL=server.js.map