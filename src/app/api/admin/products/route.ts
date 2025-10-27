import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const exists = await Product.findOne({ slug: body.slug }).lean();
  if (exists) return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 400 });
  const created = await Product.create(body);
  return NextResponse.json(created);
}
