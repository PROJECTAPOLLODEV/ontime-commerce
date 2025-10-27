import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import { applyMarkup, getMarkupPercent } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) return notFound();

  const mp = await getMarkupPercent();
  const price = applyMarkup(product?.price?.amount ?? 0, mp);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.images?.[0] ?? "/placeholder.png"}
        alt={product.title}
        className="aspect-square w-full rounded bg-muted object-cover"
      />
      <div>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">{product.categories?.[0]}</div>

        <div className="mt-4 text-2xl font-semibold">${(price / 100).toFixed(2)}</div>

        <div className="mt-4 space-y-1 text-sm">
          {product.inventory?.sku && <div><span className="text-muted-foreground">SKU: </span>{product.inventory.sku}</div>}
          {/* Try to extract a brand from attributes */}
          {Array.isArray(product.attributes) && product.attributes.find((a: any) => a.key === "Brand") && (
            <div><span className="text-muted-foreground">Brand: </span>{product.attributes.find((a: any) => a.key === "Brand")?.value}</div>
          )}
        </div>

        <p className="mt-4 text-muted-foreground">{product.description}</p>

        <form action="/api/cart" method="post" className="mt-6 flex items-center gap-3">
          <input type="hidden" name="productId" value={String(product._id)} />
          <input name="quantity" defaultValue={1} min={1} type="number" className="w-24 rounded-md border px-3 py-2 text-sm" />
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm">Add to cart</button>
          <a href="/checkout" className="rounded-md border px-4 py-2 text-sm">Buy now</a>
        </form>
      </div>
    </div>
  );
}
