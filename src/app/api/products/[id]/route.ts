import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";


export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
await dbConnect();
const doc = await Product.findById(params.id).lean();
if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });
return NextResponse.json(doc);
}