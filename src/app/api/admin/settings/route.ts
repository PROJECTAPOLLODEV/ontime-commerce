import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Setting from "@/models/Setting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const s = await Setting.findOne({}).lean();
    const defaultSettings = {
      pricing: { markupPercent: 0 },
      homepage: {
        bannerImage: "",
        bannerHeading: "Your Industrial Partner",
        bannerSub: "Quality signage & materials",
        featuredProductIds: [],
        brandLogos: []
      }
    };
    return NextResponse.json(s ?? defaultSettings);
  } catch (err: any) {
    console.error("Error in GET /api/admin/settings:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log("Received settings update:", body);

    let s = await Setting.findOne({});
    if (!s) {
      console.log("No existing settings found, creating new document");
      const created = await Setting.create(body);
      console.log("Created new settings:", created);
      return NextResponse.json(created);
    }

    console.log("Updating existing settings");
    if (body.pricing?.markupPercent != null) {
      s.pricing.markupPercent = Number(body.pricing.markupPercent) || 0;
      console.log("Updated markup to:", s.pricing.markupPercent);
    }
    if (body.homepage) {
      s.homepage.bannerImage = body.homepage.bannerImage ?? s.homepage.bannerImage;
      s.homepage.bannerHeading = body.homepage.bannerHeading ?? s.homepage.bannerHeading;
      s.homepage.bannerSub = body.homepage.bannerSub ?? s.homepage.bannerSub;
      s.homepage.featuredProductIds = body.homepage.featuredProductIds ?? s.homepage.featuredProductIds;
      s.homepage.brandLogos = body.homepage.brandLogos ?? s.homepage.brandLogos;
    }

    await s.save();
    console.log("Settings saved successfully");

    const updated = await Setting.findOne({}).lean();
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Error in PUT /api/admin/settings:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
