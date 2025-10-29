import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const rows = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();

  // Serialize orders properly
  const serialized = rows.map((order: any) => ({
    _id: String(order._id),
    userId: order.userId || null,
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
    paymentStatus: order.paymentStatus || order.status || "paid",
    fulfillmentStatus: order.fulfillmentStatus || "order_received",
    trackingNumber: order.trackingNumber || "",
    notes: order.notes || "",
    stripePaymentIntentId: order.stripePaymentIntentId || "",
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  return NextResponse.json(serialized);
}
