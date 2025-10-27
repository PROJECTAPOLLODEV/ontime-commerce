import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  // Auto-generate slug if not provided
  if (!body.slug && body.title) {
    body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const exists = await Product.findOne({ slug: body.slug }).lean();
  if (exists) return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 400 });
  const created = await Product.create(body);
  return NextResponse.json(created);
}
