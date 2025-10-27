import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";


export async function GET() {
await dbConnect();
const items = await Product.find({}).sort({ createdAt: -1 }).limit(60).lean();
return NextResponse.json(items);
}


export async function POST(req: NextRequest) {
await dbConnect();
const data = await req.json();
const created = await Product.create(data);
return NextResponse.json(created, { status: 201 });
}