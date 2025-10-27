import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
