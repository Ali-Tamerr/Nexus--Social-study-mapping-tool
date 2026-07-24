import { NextResponse } from "next/server";

export async function GET() {
  const privateUrl = process.env.NEXT_PRIVATE_API_URL?.trim() || "(not set)";
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "(not set)";

  const apiUrl =
    process.env.NEXT_PRIVATE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";

  let backendReachable = "not tested";
  let backendError = "";

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      backendReachable = `${res.status} ${res.statusText}`;
    } catch (err: any) {
      backendReachable = "FAILED";
      backendError = err.message || String(err);
    }
  }

  return NextResponse.json({
    NEXT_PRIVATE_API_URL: privateUrl.replace(/^(https?:\/\/[^/]+).*/, "$1/***"),
    NEXT_PUBLIC_API_URL: publicUrl.replace(/^(https?:\/\/[^/]+).*/, "$1/***"),
    resolvedApiUrl: apiUrl ? apiUrl.replace(/^(https?:\/\/[^/]+).*/, "$1/***") : "(empty)",
    backendReachable,
    backendError,
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID_SET: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET_SET: !!process.env.AUTH_GOOGLE_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}
