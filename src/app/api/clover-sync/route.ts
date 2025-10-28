// src/app/api/clover-sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";               // ✅ use dbConnect
import Product from "@/models/Product";
import {
  getCloverToken,
  cloverGetProductsPage,
  cloverGetPrices,
} from "@/lib/clover";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();                              // ✅ call dbConnect
    const token = await getCloverToken();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");

    const pageData = await cloverGetProductsPage({ page }, token);

    // Upsert basic product info
    const itemNos: string[] = [];
    for (const p of pageData.products) {
      const cloverNo = String(p.no);
      itemNos.push(cloverNo);

      // Generate slug from title
      const slug = p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || cloverNo;

      await Product.updateOne(
        { clover_no: cloverNo },
        {
          $set: {
            clover_no: cloverNo,
            clover_id: p.ID,
            clover_type: p.type,
            title: p.title,
            slug,
            description: p.additionalProductInformation || "",
            brand: p.oemNos?.[0]?.manufacturer || p.compatibleOems?.[0]?.manufacturer || "",
            category: p.type || "",
            color: p.color,
            yield: p.yield,
            availability: p.availability,
            images: Array.isArray(p.images) ? p.images : [],
            image: p.images?.[0] || "",
            oemNos: p.oemNos || [],
          },
        },
        { upsert: true }
      );
    }

    // Fetch and persist prices (Clover allows 10 itemNos per call)
    const chunk = (arr: string[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, (i + 1) * size)
      );

    let updated = 0;
    for (const c of chunk(itemNos, 10)) {
      const priceResp = await cloverGetPrices(c, token);
      for (const item of priceResp.items || []) {
        const sl = (item.serviceLevels || [])[0];
        const price = sl?.price ? Number(sl.price) : undefined;
        if (price != null && !Number.isNaN(price)) {
          const price_amount = Math.round(price * 100);
          await Product.updateOne(
            { clover_no: item.no },
            {
              $set: {
                price_amount,
              },
            }
          );
          updated++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      page: pageData.page,
      totalPages: pageData.totalPages,
      productsInPage: pageData.products.length,
      pricesUpdated: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "sync failed" },
      { status: 500 }
    );
  }
}
