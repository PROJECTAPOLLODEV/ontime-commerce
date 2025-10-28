import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";


export async function GET() {
  await dbConnect();
  const items = await Product.find({})
    .sort({ createdAt: -1 })
    .limit(60)
    .lean();

  // Serialize for client
  const serialized = items.map((p: any) => ({
    _id: String(p._id),
    title: p.title || "",
    slug: p.slug || "",
    price_amount: p.price_amount || p.price?.amount || 0,
    image: p.image || (Array.isArray(p.images) && p.images[0]) || "",
    brand: p.brand || "",
    category: p.category || "",
  }));

  return NextResponse.json({ products: serialized });
}


export async function POST(req: NextRequest) {
await dbConnect();
const data = await req.json();
const created = await Product.create(data);
return NextResponse.json(created, { status: 201 });
}