// src/app/api/clover-refresh-prices/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";               // ✅ use dbConnect
import Product from "@/models/Product";
import { getCloverToken, cloverGetPrices } from "@/lib/clover";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();                              // ✅ call dbConnect
    const token = await getCloverToken();

    // refresh items missing price or older than 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const products = await Product.find({
      $or: [{ priceCents: { $exists: false } }, { priceUpdatedAt: { $lt: since } }],
    })
      .select({ no: 1 })
      .lean();

    const itemNos = products.map((p: any) => String(p.no));
    const chunk = (arr: string[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, (i + 1) * size)
      );

    let updated = 0;
    for (const c of chunk(itemNos, 10)) {
      const resp = await cloverGetPrices(c, token);
      for (const item of resp.items || []) {
        const sl = (item.serviceLevels || [])[0];
        const price = sl?.price ? Number(sl.price) : undefined;
        if (price != null && !Number.isNaN(price)) {
          const priceCents = Math.round(price * 100);
          await Product.updateOne(
            { no: item.no },
            { $set: { priceCents, currency: "USD", priceUpdatedAt: new Date() } }
          );
          updated++;
        }
      }
    }

    return NextResponse.json({ ok: true, candidates: itemNos.length, updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "refresh failed" },
      { status: 500 }
    );
  }
}
