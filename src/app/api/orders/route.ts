import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const rows = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json(rows);
}
