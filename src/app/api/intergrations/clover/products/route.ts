import { NextRequest, NextResponse } from "next/server";
import { Clover } from "@/lib/clover";
export async function POST(req: NextRequest) {
  const { page, filters } = await req.json().catch(() => ({}));
  return NextResponse.json(await Clover.getProducts(page, filters));
}
