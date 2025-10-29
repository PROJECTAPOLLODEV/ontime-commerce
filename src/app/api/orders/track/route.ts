import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, email } = await req.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Order number is the last 8 characters of the _id in uppercase
    // So we need to find orders where the last 8 chars of _id match
    const allOrders = await Order.find({ email: email.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .lean();

    // Find the order that matches the order number
    const order = allOrders.find((o: any) => {
      const orderId = String(o._id).slice(-8).toUpperCase();
      return orderId === orderNumber.toUpperCase().trim();
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order number and email." },
        { status: 404 }
      );
    }

    // Serialize order
    const serialized = {
      _id: String(order._id),
      email: order.email || "",
      items: (order.items || []).map((item: any) => ({
        productId: String(item.productId),
        title: item.title || "",
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || "",
        sku: item.sku || "",
      })),
      shippingAddress: order.shippingAddress || {},
      subtotal: order.subtotal || 0,
      shipping: order.shipping || 0,
      tax: order.tax || 0,
      amount: order.amount || 0,
      currency: order.currency || "usd",
      paymentStatus: order.paymentStatus || "paid",
      fulfillmentStatus: order.fulfillmentStatus || "order_received",
      trackingNumber: order.trackingNumber || "",
      createdAt: order.createdAt,
    };

    return NextResponse.json({ order: serialized });
  } catch (err: any) {
    console.error("Error tracking order:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to track order" },
      { status: 500 }
    );
  }
}
