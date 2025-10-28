import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = Math.min(Number(searchParams.get("limit") || "8"), 20);

    if (q.trim().length < 2) {
      return NextResponse.json({ products: [] });
    }

    // Search in title, brand, and category
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    })
      .select("title slug price_amount image images brand category")
      .limit(limit)
      .lean();

    // Serialize for client
    const serialized = products.map((p: any) => ({
      _id: String(p._id),
      title: p.title || "",
      slug: p.slug || "",
      price_amount: p.price_amount || 0,
      image: p.image || (Array.isArray(p.images) && p.images[0]) || "",
      brand: p.brand || "",
      category: p.category || "",
    }));

    return NextResponse.json({ products: serialized });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: err?.message || "Search failed" },
      { status: 500 }
    );
  }
}
