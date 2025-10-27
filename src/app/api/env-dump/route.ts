import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.CLOVER_BASE_URL || "";
  const env  = (process.env.CLOVER_ENV || "").toLowerCase();
  const key  = env === "production" ? process.env.CLOVER_API_KEY_PROD : process.env.CLOVER_API_KEY_SANDBOX;

  return NextResponse.json({
    CLOVER_BASE_URL: base,
    CLOVER_ENV: env,
    CLOVER_API_KEY_fingerprint: key ? `${key.slice(0,6)}…${key.slice(-6)}` : "MISSING",
  });
}
