import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl =
    process.env.NEXT_PRIVATE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";

  const results: Record<string, unknown> = {
    apiUrl: apiUrl ? apiUrl.replace(/^(https?:\/\/[^/]+).*/, "$1/***") : "(empty)",
  };

  // Test 1: GET /health
  try {
    const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) });
    results.healthCheck = `${res.status} ${res.statusText}`;
  } catch (err: any) {
    results.healthCheck = `FAILED: ${err.message}`;
  }

  // Test 2: POST /api/auth/oauth (the exact call that signIn does)
  try {
    const res = await fetch(`${apiUrl}/api/auth/oauth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Provider: "google",
        ProviderUserId: "test-debug-12345",
        Email: "debug-test-nonexistent@example.com",
        DisplayName: "Debug Test",
        AvatarUrl: null,
      }),
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();
    results.oauthEndpoint = `${res.status} ${res.statusText}`;
    results.oauthBody = text.substring(0, 300);
  } catch (err: any) {
    results.oauthEndpoint = `FAILED: ${err.message}`;
    results.oauthError = err.cause ? String(err.cause) : undefined;
  }

  // Test 3: GET /api/profiles/email/... (the profile lookup)
  try {
    const res = await fetch(`${apiUrl}/api/profiles/email/${encodeURIComponent("debug-test@example.com")}`, {
      signal: AbortSignal.timeout(5000),
    });
    results.profileLookup = `${res.status} ${res.statusText}`;
  } catch (err: any) {
    results.profileLookup = `FAILED: ${err.message}`;
  }

  return NextResponse.json(results);
}
