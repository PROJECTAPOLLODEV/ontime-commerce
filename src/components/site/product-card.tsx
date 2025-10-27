import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";


export default function ProductCard({ product }: { product: any }) {
return (
<Link href={`/product/${product.slug}`}>
<Card className="hover:shadow">
<CardContent className="p-4">
<div className="aspect-square w-full overflow-hidden rounded bg-muted">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img alt={product.title} src={product.images?.[0] ?? "/placeholder.png"} className="h-full w-full object-cover" />
</div>
<div className="mt-3 text-sm">{product.title}</div>
<div className="text-base font-semibold">${(product.price?.amount ?? 0) / 100}</div>
</CardContent>
</Card>
</Link>
);
}