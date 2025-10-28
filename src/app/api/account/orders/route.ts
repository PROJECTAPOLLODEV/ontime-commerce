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

    // Find all orders for this user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

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
      amount: order.amount || 0,
      currency: order.currency || "usd",
      status: order.status || "paid",
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
