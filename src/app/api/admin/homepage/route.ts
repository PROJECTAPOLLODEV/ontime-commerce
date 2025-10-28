import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

// GET - Retrieve homepage settings
export async function GET() {
  try {
    await dbConnect();
    const settings = await Setting.findOne({}).lean();
    
    if (!settings || !settings.homepage) {
      return NextResponse.json({
        bannerImage: "",
        bannerHeading: "Your Industrial Partner",
        bannerSub: "Quality signage & materials",
        featuredProductIds: [],
        brandLogos: [],
        features: [],
      });
    }

    return NextResponse.json({
      bannerImage: settings.homepage.bannerImage || "",
      bannerHeading: settings.homepage.bannerHeading || "Your Industrial Partner",
      bannerSub: settings.homepage.bannerSub || "Quality signage & materials",
      featuredProductIds: (settings.homepage.featuredProductIds || []).map((id: any) => String(id)),
      brandLogos: settings.homepage.brandLogos || [],
      features: settings.homepage.features || [],
    });
  } catch (err: any) {
    console.error("Error fetching homepage settings:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST - Save homepage settings
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    const { bannerImage, bannerHeading, bannerSub, featuredProductIds, brandLogos, features } = data;

    // Find or create settings document
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = new Setting({});
    }

    // Update homepage settings
    settings.homepage = {
      bannerImage: bannerImage || "",
      bannerHeading: bannerHeading || "Your Industrial Partner",
      bannerSub: bannerSub || "Quality signage & materials",
      featuredProductIds: featuredProductIds || [],
      brandLogos: brandLogos || [],
      features: features || [],
    };

    await settings.save();

    return NextResponse.json({ success: true, message: "Homepage settings saved successfully" });
  } catch (err: any) {
    console.error("Error saving homepage settings:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
