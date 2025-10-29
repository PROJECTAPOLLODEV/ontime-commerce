// Development endpoint to create orders after successful Stripe checkout
// This is used when webhooks aren't available (local development)
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
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

    // Parse compact items format: "productId:quantity,productId:quantity,..."
    const itemsCompact = session.metadata?.itemsCompact || "";
    const itemPairs = itemsCompact.split(",").filter(Boolean);

    console.log("Creating order for session:", sessionId);
    console.log("Item pairs:", itemPairs);

    // Reconstruct items from database
    const items = [];
    for (const pair of itemPairs) {
      const [productId, quantityStr] = pair.split(":");
      const quantity = parseInt(quantityStr) || 1;

      try {
        const product = await Product.findById(productId).lean();
        if (product) {
          // Get the price from line items (which includes markup)
          const lineItem = session.line_items?.data?.find((li: any) =>
            li.description?.includes(product.title)
          );

          items.push({
            productId: String(product._id),
            title: product.title || "",
            price: lineItem?.price?.unit_amount || product.price_amount || 0,
            quantity: quantity,
            image: product.image || (Array.isArray(product.images) ? product.images[0] : "") || "",
            sku: product.sku || "",
          });
        }
      } catch (err) {
        console.error("Error fetching product:", productId, err);
      }
    }

    const userId = session.metadata?.userId === "guest" ? null : session.metadata?.userId;

    console.log("=== ORDER CREATION DEBUG ===");
    console.log("Session ID:", sessionId);
    console.log("User ID from metadata:", session.metadata?.userId);
    console.log("User ID parsed:", userId);
    console.log("Email:", session.metadata?.email || session.customer_email);
    console.log("Items reconstructed:", items.length);

    // Reconstruct shipping address from separate fields
    const shippingAddress = {
      name: session.metadata?.shipName || "",
      line1: session.metadata?.shipLine1 || "",
      line2: session.metadata?.shipLine2 || "",
      city: session.metadata?.shipCity || "",
      state: session.metadata?.shipState || "",
      postalCode: session.metadata?.shipZip || "",
      country: session.metadata?.shipCountry || "US",
    };

    // Create order in database
    const order = await Order.create({
      userId: userId,
      email: session.metadata?.email || session.customer_email,
      items: items,
      shippingAddress: shippingAddress,
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

    console.log("✅ Order created successfully:", order._id);
    console.log("📝 Order userId saved in DB:", order.userId);
    console.log("📝 Order email:", order.email);

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
