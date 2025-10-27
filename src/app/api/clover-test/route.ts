import { NextResponse } from "next/server";
import { _cloverActiveEnvForDebug } from "@/lib/cloverAuth";
export const runtime = "nodejs";
export async function GET() {
  const { env, keyPrefix } = _cloverActiveEnvForDebug();
  return NextResponse.json({
    base: process.env.CLOVER_BASE_URL || null,
    env,
    keyPrefix, // only shows first 8 chars for safety
  });
}
