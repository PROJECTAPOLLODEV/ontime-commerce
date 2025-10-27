import Link from "next/link";
import { applyMarkup, getMarkupPercent } from "@/lib/pricing";

export default async function ProductCard({ product }: { product: any }) {
  const mp = await getMarkupPercent();
  const final = applyMarkup(product?.price?.amount ?? 0, mp);

  return (
    <Link href={`/product/${product.slug}`} className="group block rounded-md border p-3 hover:shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.images?.[0] ?? "/placeholder.png"}
        alt={product.title}
        className="aspect-square w-full rounded-md object-cover"
      />
      <div className="mt-3">
        <div className="line-clamp-2 text-sm font-medium">{product.title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{product.categories?.[0]}</div>
        <div className="mt-1 font-semibold">${(final / 100).toFixed(2)}</div>
      </div>
    </Link>
  );
}
