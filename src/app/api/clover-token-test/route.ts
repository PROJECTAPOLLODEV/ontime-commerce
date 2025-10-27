import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const base = process.env.CLOVER_BASE_URL;
    const env  = (process.env.CLOVER_ENV ?? "sandbox").trim().toLowerCase();

    if (!base) throw new Error("CLOVER_BASE_URL missing");

    const rawKey =
      env === "production"
        ? process.env.CLOVER_API_KEY_PROD
        : process.env.CLOVER_API_KEY_SANDBOX;

    const key = (rawKey ?? "").trim();
    if (!key) throw new Error(`Clover API key missing for env="${env}"`);
    if (key.length < 40) {
      throw new Error(
        `Clover API key for env="${env}" looks too short (len=${key.length}). Paste it again without quotes or extra spaces.`
      );
    }

    const res = await fetch(`${base}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: key }),
      cache: "no-store",
    });

    const text = await res.text();

    // ASCII-only fingerprint for headers
    const fp = `${key.slice(0, 6)}...${key.slice(-6)}`;

    return new NextResponse(
      JSON.stringify(
        {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          bodyPreview: text.slice(0, 400),
          env: { base, env, keyFingerprint: fp },
        },
        null,
        2
      ),
      {
        status: res.ok ? 200 : res.status,
        headers: {
          "content-type": "application/json",
          "x-debug-base": base,
          "x-debug-env": env,
          "x-debug-key": fp, // ASCII only now
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || String(e),
        stack: e?.stack?.split("\n").slice(0, 2).join(" | "),
        env: {
          base: process.env.CLOVER_BASE_URL ?? null,
          env: process.env.CLOVER_ENV ?? null,
          hasProdKey: Boolean(process.env.CLOVER_API_KEY_PROD),
          hasSandboxKey: Boolean(process.env.CLOVER_API_KEY_SANDBOX),
        },
      },
      { status: 500 }
    );
  }
}
