import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const results: Record<string, unknown> = {};

  // Test 1: What does /api/auth/session return?
  try {
    const baseUrl = new URL(req.url).origin;
    const res = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { cookie: req.headers.get("cookie") || "" },
      signal: AbortSignal.timeout(5000),
    });
    results.sessionStatus = `${res.status} ${res.statusText}`;
    results.sessionHeaders = Object.fromEntries(res.headers.entries());
    const text = await res.text();
    results.sessionBodyLength = text.length;
    results.sessionBody = text.substring(0, 500);
  } catch (err: any) {
    results.sessionError = err.message;
  }

  // Test 2: What does /api/auth/providers return?
  try {
    const baseUrl = new URL(req.url).origin;
    const res = await fetch(`${baseUrl}/api/auth/providers`, {
      signal: AbortSignal.timeout(5000),
    });
    results.providersStatus = `${res.status} ${res.statusText}`;
    const text = await res.text();
    results.providersBodyLength = text.length;
    results.providersBody = text.substring(0, 500);
  } catch (err: any) {
    results.providersError = err.message;
  }

  // Test 3: Check AUTH_URL / NEXTAUTH_URL configuration
  results.authUrl = process.env.AUTH_URL || "(not set)";
  results.nextauthUrl = process.env.NEXTAUTH_URL || "(not set)";
  results.vercelUrl = process.env.VERCEL_URL || "(not set)";
  results.requestOrigin = new URL(req.url).origin;

  return NextResponse.json(results);
}
