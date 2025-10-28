import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

async function getOrSetCookieId() {
  const jar = await cookies();
  let id = jar.get("cid")?.value;
  if (!id) {
    id = Math.random().toString(36).slice(2);
    jar.set("cid", id, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
  }
  return id!;
}

export async function GET() {
  await dbConnect();
  const cid = await getOrSetCookieId();
  const cart = await Cart.findOne({ cookieId: cid }).lean();

  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  // Serialize to prevent MongoDB object issues
  const serializedCart = {
    items: (cart.items || []).map((item: any) => ({
      productId: String(item.productId),
      title: item.title || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || "",
      sku: item.sku || "",
    })),
  };

  return NextResponse.json(serializedCart);
}

// Add or update cart item
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const contentType = req.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const fd = await req.formData();
      data = Object.fromEntries(fd.entries());
    }

    const action = data._action as string | undefined;
    const cid = await getOrSetCookieId();
    const cart = (await Cart.findOne({ cookieId: cid })) || new Cart({ cookieId: cid, items: [] });

    // Handle form-based update action
    if (action === "update") {
      const { productId, quantity } = data;
      const q = Math.max(1, Number(quantity || 1));
      const idx = cart.items.findIndex((i: any) => String(i.productId) === String(productId));
      if (idx >= 0) cart.items[idx].quantity = q;
      await cart.save();
      return NextResponse.redirect(new URL("/cart", req.url));
    }

    // Handle form-based remove action
    if (action === "remove") {
      const { productId } = data;
      cart.items = cart.items.filter((i: any) => String(i.productId) !== String(productId));
      await cart.save();
      return NextResponse.redirect(new URL("/cart", req.url));
    }

    // Handle JSON-based add or update
    const { productId, quantity = 1 } = data;
    const p = await Product.findById(productId).lean();
    if (!p) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    const idx = cart.items.findIndex((i: any) => String(i.productId) === String(productId));
    const price = p.price_amount ?? 0;

    if (idx >= 0) {
      // If updating existing item, set quantity (not add)
      cart.items[idx].quantity = Number(quantity || 1);
    } else {
      // Add new item
      cart.items.push({
        productId,
        title: p.title,
        price,
        quantity: Number(quantity || 1),
        image: p.image || (Array.isArray(p.images) ? p.images[0] : null),
        sku: p.clover_no || "",
      });
    }

    await cart.save();

    // Return JSON for API calls, redirect for form submissions
    if (contentType.includes("application/json")) {
      const updatedCart = await Cart.findOne({ cookieId: cid }).lean();
      // Serialize to prevent MongoDB object issues
      const serializedCart = {
        items: (updatedCart?.items || []).map((item: any) => ({
          productId: String(item.productId),
          title: item.title || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || "",
          sku: item.sku || "",
        })),
      };
      return NextResponse.json({ ok: true, cart: serializedCart });
    }
    return NextResponse.redirect(new URL("/cart", req.url));
  } catch (err: any) {
    console.error("Cart POST error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { productId } = await req.json();

    const cid = await getOrSetCookieId();
    const cart = await Cart.findOne({ cookieId: cid });

    if (!cart) {
      return NextResponse.json({ ok: false, error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter((i: any) => String(i.productId) !== String(productId));
    await cart.save();

    const updatedCart = await Cart.findOne({ cookieId: cid }).lean();
    // Serialize to prevent MongoDB object issues
    const serializedCart = {
      items: (updatedCart?.items || []).map((item: any) => ({
        productId: String(item.productId),
        title: item.title || "",
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || "",
        sku: item.sku || "",
      })),
    };

    return NextResponse.json({ ok: true, cart: serializedCart });
  } catch (err: any) {
    console.error("Cart DELETE error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to remove item" },
      { status: 500 }
    );
  }
}
