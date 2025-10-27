import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Setting from "@/models/Setting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const s = await Setting.findOne({}).lean();
  return NextResponse.json(
    s ?? { pricing: { markupPercent: 0 }, homepage: { bannerImage: "", bannerHeading: "", bannerSub: "", featuredProductIds: [], brandLogos: [] } }
  );
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const s = await Setting.findOne({});
  if (!s) {
    const created = await Setting.create(body);
    return NextResponse.json(created);
  }
  if (body.pricing?.markupPercent != null) s.pricing.markupPercent = Number(body.pricing.markupPercent) || 0;
  if (body.homepage) {
    s.homepage.bannerImage = body.homepage.bannerImage ?? s.homepage.bannerImage;
    s.homepage.bannerHeading = body.homepage.bannerHeading ?? s.homepage.bannerHeading;
    s.homepage.bannerSub = body.homepage.bannerSub ?? s.homepage.bannerSub;
    s.homepage.featuredProductIds = body.homepage.featuredProductIds ?? s.homepage.featuredProductIds;
    s.homepage.brandLogos = body.homepage.brandLogos ?? s.homepage.brandLogos;
  }
  await s.save();
  return NextResponse.json(await Setting.findOne({}).lean());
}
