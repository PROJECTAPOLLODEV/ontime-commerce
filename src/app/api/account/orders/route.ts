import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    console.log("=== ACCOUNT ORDERS DEBUG ===");
    console.log("🔍 Clerk userId from auth():", userId);
    console.log("🔍 Querying for orders with userId:", userId);

    // Find all orders for this user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log("📊 Orders found:", orders.length);
    if (orders.length > 0) {
      console.log("📝 First order userId:", orders[0].userId);
      console.log("📝 First order email:", orders[0].email);
      console.log("📝 First order _id:", orders[0]._id);
    } else {
      // If no orders found, let's check if any orders exist at all
      const anyOrders = await Order.find({}).sort({ createdAt: -1 }).limit(3).lean();
      console.log("📋 Total orders in DB:", await Order.countDocuments({}));
      if (anyOrders.length > 0) {
        console.log("📝 Sample order userIds in DB:", anyOrders.map((o: any) => ({ userId: o.userId, email: o.email })));
      }
    }

    // Serialize orders
    const serialized = orders.map((order: any) => ({
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
      paymentStatus: order.paymentStatus || order.status || "paid",
      fulfillmentStatus: order.fulfillmentStatus || "order_received",
      trackingNumber: order.trackingNumber || "",
      createdAt: order.createdAt,
    }));

    return NextResponse.json({ orders: serialized });
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
