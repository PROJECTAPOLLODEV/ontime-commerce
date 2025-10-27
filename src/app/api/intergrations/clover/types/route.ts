import { NextResponse } from "next/server";
import { Clover } from "@/lib/clover";
export async function POST() {
  return NextResponse.json(await Clover.getAllProductTypes());
}
