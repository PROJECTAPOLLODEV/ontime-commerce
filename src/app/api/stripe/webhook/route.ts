// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";

export const dynamic = "force-dynamic"; // ensure no caching
export const runtime = "nodejs";        // Stripe SDK needs Node runtime

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      await dbConnect();
      const session = event.data.object as any;

      console.log("Processing checkout session:", session.id);

      // Parse metadata
      const items = JSON.parse(session.metadata.items || "[]");
      const shippingAddress = JSON.parse(session.metadata.shippingAddress || "{}");
      const userId = session.metadata.userId === "guest" ? null : session.metadata.userId;

      // Create order in database
      const order = await Order.create({
        userId: userId,
        email: session.metadata.email || session.customer_email,
        items: items.map((item: any) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
          sku: item.sku || "",
        })),
        shippingAddress: {
          name: shippingAddress.name || "",
          line1: shippingAddress.line1 || "",
          line2: shippingAddress.line2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postalCode || "",
          country: shippingAddress.country || "US",
        },
        subtotal: parseInt(session.metadata.subtotal || "0"),
        shipping: parseInt(session.metadata.shipping || "0"),
        tax: parseInt(session.metadata.tax || "0"),
        amount: session.amount_total,
        currency: session.currency || "usd",
        stripePaymentIntentId: session.payment_intent,
        stripeSessionId: session.id,
        paymentStatus: "paid",
        fulfillmentStatus: "order_received",
      });

      console.log("Order created successfully:", order._id);

      // Clear the user's cart if they have one
      if (userId) {
        try {
          await Cart.deleteMany({ userId });
          console.log("Cart cleared for user:", userId);
        } catch (cartErr) {
          console.error("Error clearing cart:", cartErr);
        }
      }

    } catch (err: any) {
      console.error("Error processing webhook:", err);
      return new NextResponse(`Webhook processing error: ${err.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
