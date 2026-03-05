import { NextResponse, type NextRequest } from 'next/server';
import type { CallbackConfig } from '../types';

const EG_SESSION_COOKIE = 'eg_session';
const EG_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export async function handleAuthCallback(
  request: NextRequest,
  config: CallbackConfig
) {

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
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ token: egToken }),
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
      maxAge: EG_SESSION_MAX_AGE,
    });

    return response;

  } catch (err) {

    console.error("[auth callback error]", err);

    const loginUrl = `${config.ssoUrl}/auth/login`;

    const redirectTo =
      `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    return NextResponse.redirect(
      `${loginUrl}?redirect_to=${encodeURIComponent(redirectTo)}`
    );
  }
}