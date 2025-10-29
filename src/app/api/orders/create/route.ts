// Development endpoint to create orders after successful Stripe checkout
// This is used when webhooks aren't available (local development)
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    await dbConnect();

    // Check if order already exists
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      console.log("Order already exists for session:", sessionId);
      return NextResponse.json({
        success: true,
        orderId: String(existingOrder._id),
        message: "Order already created"
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Parse metadata
    const items = JSON.parse(session.metadata?.items || "[]");
    const shippingAddress = JSON.parse(session.metadata?.shippingAddress || "{}");
    const userId = session.metadata?.userId === "guest" ? null : session.metadata?.userId;

    console.log("Creating order for session:", sessionId);
    console.log("User ID:", userId);
    console.log("Items:", items.length);

    // Create order in database
    const order = await Order.create({
      userId: userId,
      email: session.metadata?.email || session.customer_email,
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
      subtotal: parseInt(session.metadata?.subtotal || "0"),
      shipping: parseInt(session.metadata?.shipping || "0"),
      tax: parseInt(session.metadata?.tax || "0"),
      amount: session.amount_total || 0,
      currency: session.currency || "usd",
      stripePaymentIntentId: session.payment_intent as string,
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

    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      message: "Order created successfully"
    });
  } catch (err: any) {
    console.error("Error creating order:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
