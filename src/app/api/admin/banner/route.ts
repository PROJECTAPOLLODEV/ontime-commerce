import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Banner from "@/models/Banner";


export async function GET() { await dbConnect(); const b = await Banner.findOne().lean(); return NextResponse.json(b); }
export async function POST(req: NextRequest) { await dbConnect(); const data = await req.json(); const b = await Banner.findOneAndUpdate({}, data, { upsert: true, new: true }); return NextResponse.json(b); }