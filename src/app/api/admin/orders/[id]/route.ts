import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

// GET - Get order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Serialize order
    const serialized = {
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
      stripeSessionId: order.stripeSessionId || "",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("Error fetching order:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH - Update order status, tracking, notes
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const updates = await req.json();

    // Only allow updating specific fields
    const allowedUpdates: any = {};
    if (updates.fulfillmentStatus) {
      allowedUpdates.fulfillmentStatus = updates.fulfillmentStatus;
    }
    if (updates.trackingNumber !== undefined) {
      allowedUpdates.trackingNumber = updates.trackingNumber;
    }
    if (updates.notes !== undefined) {
      allowedUpdates.notes = updates.notes;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return serialized order
    const serialized = {
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
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("Error updating order:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
