import { NextResponse } from "next/server";
import { Clover } from "@/lib/clover";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await Clover.getProducts(1, undefined);
    return NextResponse.json({ ok: true, sampleCount: data?.products?.length ?? 0 });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message || String(e),
      cause: (e as any)?.cause?.code ?? null,
      stack: e?.stack?.split("\n").slice(0, 3).join(" | "),
    }, { status: 500 });
  }
}
