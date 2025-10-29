// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

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

      // Parse compact items format: "productId:quantity,productId:quantity,..."
      const itemsCompact = session.metadata.itemsCompact || "";
      const itemPairs = itemsCompact.split(",").filter(Boolean);

      // Reconstruct items from database
      const items = [];
      for (const pair of itemPairs) {
        const [productId, quantityStr] = pair.split(":");
        const quantity = parseInt(quantityStr) || 1;

        try {
          const product = await Product.findById(productId).lean();
          if (product) {
            items.push({
              productId: String(product._id),
              title: product.title || "",
              price: product.price_amount || 0,
              quantity: quantity,
              image: product.image || (Array.isArray(product.images) ? product.images[0] : "") || "",
              sku: product.sku || "",
            });
          }
        } catch (err) {
          console.error("Error fetching product in webhook:", productId, err);
        }
      }

      const userId = session.metadata.userId === "guest" ? null : session.metadata.userId;

      // Reconstruct shipping address from separate fields
      const shippingAddress = {
        name: session.metadata.shipName || "",
        line1: session.metadata.shipLine1 || "",
        line2: session.metadata.shipLine2 || "",
        city: session.metadata.shipCity || "",
        state: session.metadata.shipState || "",
        postalCode: session.metadata.shipZip || "",
        country: session.metadata.shipCountry || "US",
      };

      // Create order in database
      const order = await Order.create({
        userId: userId,
        email: session.metadata.email || session.customer_email,
        items: items,
        shippingAddress: shippingAddress,
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
