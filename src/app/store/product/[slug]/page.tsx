// src/app/(store)/product/[slug]/page.tsx
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/site/add-to-cart-button";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) return notFound();

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.images?.[0] ?? "/placeholder.png"}
        alt={product.title}
        className="aspect-square w-full rounded bg-muted object-cover"
      />
      <div>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="mt-2 text-muted-foreground">{product.description}</p>
        <div className="mt-4 text-2xl font-semibold">${(product.price?.amount ?? 0) / 100}</div>
        <div className="mt-6">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
