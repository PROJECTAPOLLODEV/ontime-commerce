import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import { applyMarkup, getMarkupPercent } from "@/lib/pricing";
import Link from "next/link";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartForm from "@/components/AddToCartForm";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const product = await Product.findOne({ slug }).lean();
  if (!product) return notFound();

  const mp = await getMarkupPercent();
  const price = applyMarkup(product?.price?.amount ?? 0, mp);

  // Extract brand from attributes
  const brand = Array.isArray(product.attributes)
    ? product.attributes.find((a: any) => a.key === "Brand")?.value
    : null;

  // Get product images
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["/placeholder.png"];

  // Get related products from same category
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    categories: { $in: product.categories || [] },
  })
    .limit(4)
    .lean();

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {product.categories?.[0] && (
              <>
                <Link href={`/shop?category=${encodeURIComponent(product.categories[0])}`} className="hover:text-foreground transition-colors">
                  {product.categories[0]}
                </Link>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-foreground font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <ProductImageGallery images={images} title={product.title} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Brand */}
            <div>
              {brand && (
                <Link href={`/shop?brand=${encodeURIComponent(brand)}`} className="inline-block mb-2 text-sm font-semibold text-primary hover:underline">
                  {brand}
                </Link>
              )}
              <h1 className="text-3xl font-bold leading-tight lg:text-4xl">{product.title}</h1>
              {product.categories?.[0] && (
                <div className="mt-2 flex items-center gap-2">
                  <Link href={`/shop?category=${encodeURIComponent(product.categories[0])}`} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {product.categories[0]}
                  </Link>
                </div>
              )}
            </div>

            {/* Price and Stock */}
            <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-background p-6">
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-bold text-primary">${(price / 100).toFixed(2)}</div>
                {product.price?.amount && product.price.amount !== price && (
                  <div className="text-lg text-muted-foreground line-through">
                    ${(product.price.amount / 100).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">In Stock</span>
              </div>

              {/* SKU */}
              {product.inventory?.sku && (
                <div className="mt-3 text-sm text-muted-foreground">
                  SKU: <span className="font-mono font-medium">{product.inventory.sku}</span>
                </div>
              )}
            </div>

            {/* Add to Cart Form */}
            <AddToCartForm productId={String(product._id)} />

            {/* Product Attributes */}
            {Array.isArray(product.attributes) && product.attributes.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Product Specifications</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.attributes.map((attr: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-1 rounded-lg bg-muted/30 p-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{attr.key}</span>
                      <span className="text-sm font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Share:</span>
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-colors hover:bg-accent" aria-label="Share on Facebook">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-colors hover:bg-accent" aria-label="Share on Twitter">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-colors hover:bg-accent" aria-label="Copy link">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="mt-12 rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-bold">Product Description</h2>
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p: any) => {
                const relatedPrice = applyMarkup(p?.price?.amount ?? 0, mp);
                return (
                  <Link
                    key={String(p._id)}
                    href={`/product/${p.slug || p._id}`}
                    className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={p.images?.[0] ?? "/placeholder.png"}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <div className="mt-2 text-lg font-bold text-primary">
                        ${(relatedPrice / 100).toFixed(2)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
