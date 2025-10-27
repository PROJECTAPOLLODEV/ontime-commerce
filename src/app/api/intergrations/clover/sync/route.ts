import { NextRequest, NextResponse } from "next/server";
import { Clover } from "@/lib/clover";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function runSync() {
  await dbConnect();
  let page = 1;
  let totalImported = 0;

  // pull all pages
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await Clover.getProducts(page, undefined);

    for (const p of data.products) {
      const priceCents =
        p?.serviceLevels?.[0]?.price != null
          ? Math.round(parseFloat(p.serviceLevels[0].price) * 100)
          : 0;

      await Product.findOneAndUpdate(
        { "external.source": "clover", "external.externalId": String(p.ID) },
        {
          title: p.title,
          slug: slugify(p.title),
          description: p.additionalProductInformation || p.title,
          images: Array.isArray(p.images) ? p.images : [],
          categories: [p.type].filter(Boolean),
          attributes: [
            ...(p.color ? [{ key: "Color", value: p.color }] : []),
            ...(p.yield ? [{ key: "Yield", value: p.yield }] : []),
          ],
          price: { currency: "usd", amount: priceCents },
          inventory: { sku: p.no ?? "", quantity: 0 },
          external: { source: "clover", externalId: String(p.ID), raw: p },
        },
        { upsert: true }
      );

      totalImported++;
    }

    if (page >= (data.totalPages || 1)) break;
    page += 1;
  }

  return { ok: true, imported: totalImported };
}

export async function POST() {
  try {
    const out = await runSync();
    return NextResponse.json(out);
  } catch (e: any) {
    console.error("Clover sync error:", e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || "sync failed" }, { status: 500 });
  }
}

// Add GET too so you can hit it in the browser
export async function GET(_req: NextRequest) {
  return POST();
}
