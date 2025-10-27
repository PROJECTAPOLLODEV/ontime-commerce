import { NextResponse } from "next/server";
import { getCloverToken } from "@/lib/cloverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getCloverToken();
    const res = await fetch(`${process.env.CLOVER_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ page: 1 }),
    });
    const txt = await res.text();
    return NextResponse.json({ status: res.status, ok: res.ok, preview: txt.slice(0, 600) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
