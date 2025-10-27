import { NextRequest, NextResponse } from "next/server";
import { Clover } from "@/lib/clover";
export async function POST(req: NextRequest) {
  const { itemNos } = await req.json();
  return NextResponse.json(await Clover.getPrices(itemNos));
}
