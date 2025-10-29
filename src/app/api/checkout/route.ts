import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calculateShippingByState } from "@/lib/shipping";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { email, items, shippingAddress, userId } = await req.json();

    console.log("=== CHECKOUT API DEBUG ===");
    console.log("userId received from client:", userId);
    console.log("email:", email);
    console.log("items count:", items?.length);

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Email and items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1 || !shippingAddress.state) {
      return NextResponse.json(
        { error: "Shipping address with state is required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = calculateShippingByState(shippingAddress.state, subtotal); // State-based shipping from TN
    const tax = Math.round(subtotal * 0.085); // 8.5% tax
    const total = subtotal + shipping + tax;

    // Create Stripe line items from cart items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: item.price, // Price in cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: shipping,
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax (8.5%)",
        },
        unit_amount: tax,
      },
      quantity: 1,
    });

    // Store minimal item data to avoid 500 char metadata limit
    // Format: "productId:quantity,productId:quantity,..."
    const itemsCompact = items.map((item: any) =>
      `${item.productId}:${item.quantity}`
    ).join(",");

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: email,
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
      metadata: {
        email,
        userId: userId || "guest",
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        tax: tax.toString(),
        total: total.toString(),
        // Store compact items format (stays under 500 chars)
        itemsCompact: itemsCompact,
        // Store shipping address fields separately to avoid limit
        shipName: shippingAddress.name || "",
        shipLine1: shippingAddress.line1 || "",
        shipLine2: shippingAddress.line2 || "",
        shipCity: shippingAddress.city || "",
        shipState: shippingAddress.state || "",
        shipZip: shippingAddress.postalCode || "",
        shipCountry: shippingAddress.country || "US",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
