// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic"; // ensure no caching
export const runtime = "nodejs";        // Stripe SDK needs Node runtime

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await dbConnect();
    const s = event.data.object as any;
    await Order.create({
      userId: s.client_reference_id ?? null,
      stripePaymentIntentId: s.payment_intent,
      amount: s.amount_total,
      currency: s.currency ?? "usd",
      items: [], // you can persist cart items by passing them via metadata
      status: "paid",
    });
  }

  return NextResponse.json({ received: true });
}
