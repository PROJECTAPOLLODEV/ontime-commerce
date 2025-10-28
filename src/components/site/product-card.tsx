import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="aspect-square w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={product.title}
              src={product.images?.[0] ?? "/placeholder.png"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                ${((product.price_amount ?? product.price?.amount ?? 0) / 100).toFixed(2)}
              </span>
            </div>
            {product.brand && (
              <div className="text-xs text-muted-foreground font-medium">
                {product.brand}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}