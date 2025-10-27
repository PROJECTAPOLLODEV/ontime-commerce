import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import Cart from "@/models/Cart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  await dbConnect();

  const jar = await cookies();
  const cid = jar.get("cid")?.value ?? null;

  const cart = cid ? await Cart.findOne({ cookieId: cid }).lean() : null;
  const items = cart?.items ?? [];
  const subtotal = items.reduce((s: number, i: any) => s + (i.price ?? 0) * (i.quantity ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-muted-foreground">
          Your cart is empty. <Link href="/shop" className="underline">Continue shopping</Link>.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.image ?? "/placeholder.png"} alt="" className="h-14 w-14 rounded object-cover bg-muted" />
                        <div className="max-w-[380px]">
                          <div className="font-medium">{i.title}</div>
                          {i.sku && <div className="text-xs text-muted-foreground">SKU: {i.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">${((i.price ?? 0) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <form action="/api/cart" method="post" className="flex items-center gap-2">
                        <input type="hidden" name="_action" value="update" />
                        <input type="hidden" name="productId" value={i.productId} />
                        <input
                          name="quantity"
                          defaultValue={i.quantity}
                          min={1}
                          type="number"
                          className="w-20 rounded-md border px-2 py-1"
                        />
                        <button className="rounded-md border px-2 py-1">Update</button>
                      </form>
                      <form action="/api/cart" method="post" className="mt-1">
                        <input type="hidden" name="_action" value="remove" />
                        <input type="hidden" name="productId" value={i.productId} />
                        <button className="text-xs text-destructive underline">Remove</button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${(((i.price ?? 0) * (i.quantity ?? 0)) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-6">
            <div className="text-lg">Subtotal</div>
            <div className="text-2xl font-semibold">${(subtotal / 100).toFixed(2)}</div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/shop" className="rounded-md border px-4 py-2 text-sm">Continue shopping</Link>
            <Link href="/checkout" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
