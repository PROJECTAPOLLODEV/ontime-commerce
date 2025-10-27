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
  return NextResponse.json(cart ?? { items: [] });
}

// Add or form submit from PDP
export async function POST(req: NextRequest) {
  await dbConnect();
  const contentType = req.headers.get("content-type") || "";
  let data: any = {};
  if (contentType.includes("application/json")) data = await req.json();
  else if (contentType.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData();
    data = Object.fromEntries(fd.entries());
  }

  const action = data._action as string | undefined;

  const cid = await getOrSetCookieId();
  const cart = (await Cart.findOne({ cookieId: cid })) || new Cart({ cookieId: cid, items: [] });

  if (action === "update") {
    const { productId, quantity } = data;
    const q = Math.max(1, Number(quantity || 1));
    const idx = cart.items.findIndex((i: any) => String(i.productId) === String(productId));
    if (idx >= 0) cart.items[idx].quantity = q;
    await cart.save();
    return NextResponse.redirect(new URL("/cart", req.url));
  }

  if (action === "remove") {
    const { productId } = data;
    cart.items = cart.items.filter((i: any) => String(i.productId) !== String(productId));
    await cart.save();
    return NextResponse.redirect(new URL("/cart", req.url));
  }

  // default: add
  const { productId, quantity = 1 } = data;
  const p = await Product.findById(productId).lean();
  if (!p) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });

  const idx = cart.items.findIndex((i: any) => String(i.productId) === String(productId));
  const price = p.price?.amount ?? 0; // base cents; markup applied on display only
  if (idx >= 0) cart.items[idx].quantity += Number(quantity || 1);
  else
    cart.items.push({
      productId,
      title: p.title,
      price,
      quantity: Number(quantity || 1),
      image: p.images?.[0] ?? null,
      sku: p.inventory?.sku ?? "",
    });

  await cart.save();
  return NextResponse.redirect(new URL("/cart", req.url));
}
