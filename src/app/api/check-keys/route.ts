import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    publishableKeyStart: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) || 'MISSING',
    secretKeyStart: process.env.CLERK_SECRET_KEY?.substring(0, 20) || 'MISSING',
    publishableKeyLength: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length || 0,
    secretKeyLength: process.env.CLERK_SECRET_KEY?.length || 0,
  });
}
