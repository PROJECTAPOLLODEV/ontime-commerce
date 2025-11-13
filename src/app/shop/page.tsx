import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import ShopFilters from "@/components/ShopFilters";
import ProductCard from "@/components/ProductCard";
import PageJump from "@/components/PageJump";
import { applyMarkup, getMarkupPercent } from "@/lib/pricing";

function toNum(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  brand?: string;
  category?: string;
  page?: string;
  size?: string;
  min?: string;
  max?: string;
  sort?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await dbConnect();

  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const brand = (sp.brand ?? "").trim();
  const category = (sp.category ?? "").trim();
  const sort = sp.sort ?? "newest";

  const page = Math.max(1, toNum(sp.page, 1));
  const size = Math.min(60, Math.max(1, toNum(sp.size, 24))); // clamp 1..60

  const min = toNum(sp.min, 0);
  const max = toNum(sp.max, 0); // 0 = no max

  const filter: any = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  if (brand) filter.brand = brand;
  if (category) filter.category = category;
  if (min > 0 || max > 0) {
    filter.price_amount = {};
    if (min > 0) filter.price_amount.$gte = min * 100;
    if (max > 0) filter.price_amount.$lte = max * 100;
  }

  // Get unique brands and categories for filters
  const allBrands = await Product.distinct("brand", {});
  const allCategories = await Product.distinct("category", {});

  // Determine sort order
  let sortQuery: any = { createdAt: -1 }; // default: newest
  if (sort === "price-asc") sortQuery = { price_amount: 1 };
  if (sort === "price-desc") sortQuery = { price_amount: -1 };
  if (sort === "name-asc") sortQuery = { title: 1 };
  if (sort === "name-desc") sortQuery = { title: -1 };

  const total = await Product.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / size));
  const pageSafe = Math.min(page, pages);
  const productsDocs = await Product.find(filter)
    .sort(sortQuery)
    .skip((pageSafe - 1) * size)
    .limit(size)
    .lean();

  // Get markup percentage
  const mp = await getMarkupPercent();

  // Serialize products to plain objects for client components and apply markup
  const products = productsDocs.map((p: any) => ({
    _id: String(p._id),
    title: p.title || "",
    slug: p.slug || "",
    price_amount: applyMarkup(p.price_amount || 0, mp),
    callForPricing: p.callForPricing || false,
    image: p.image || "",
    images: Array.isArray(p.images) ? p.images : [],
    brand: p.brand || "",
    category: p.category || "",
  }));

  const qs = (overrides: Partial<SearchParams>) => {
    const base = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(brand ? { brand } : {}),
      ...(category ? { category } : {}),
      ...(min ? { min: String(min) } : {}),
      ...(max ? { max: String(max) } : {}),
      ...(sort && sort !== "newest" ? { sort } : {}),
      page: String(overrides.page ?? pageSafe),
      size: String(overrides.size ?? size),
    });
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) return;
      base.set(k, String(v));
    });
    return base.toString();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shop</h1>
        <div className="text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <ShopFilters
            brands={allBrands.filter(Boolean)}
            categories={allCategories.filter(Boolean)}
            currentBrand={brand}
            currentCategory={category}
            currentMin={min}
            currentMax={max}
            currentSort={sort}
          />
        </aside>

        {/* Main Content */}
        <div>
          {/* Active Filters */}
          {(q || brand || category || min > 0 || max > 0) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {q && (
                <Link
                  href={`/shop?${qs({ q: undefined })}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs hover:bg-primary/20"
                >
                  Search: {q} ✕
                </Link>
              )}
              {brand && (
                <Link
                  href={`/shop?${qs({ brand: undefined })}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs hover:bg-primary/20"
                >
                  Brand: {brand} ✕
                </Link>
              )}
              {category && (
                <Link
                  href={`/shop?${qs({ category: undefined })}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs hover:bg-primary/20"
                >
                  Category: {category} ✕
                </Link>
              )}
              {(min > 0 || max > 0) && (
                <Link
                  href={`/shop?${qs({ min: undefined, max: undefined })}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs hover:bg-primary/20"
                >
                  Price: ${min || 0} - ${max || "∞"} ✕
                </Link>
              )}
              <Link
                href="/shop"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                No products found matching your criteria.
              </p>
              <Link href="/shop" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-8 space-y-4 border-t pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {pageSafe} of {pages} ({total} total products)
                </div>
                <div className="flex items-center gap-2">
                  {pageSafe > 1 && (
                    <>
                      <Link
                        href={`/shop?${qs({ page: 1 })}`}
                        className="rounded-md border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                        title="First page"
                      >
                        ««
                      </Link>
                      <Link
                        href={`/shop?${qs({ page: pageSafe - 1 })}`}
                        className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                      >
                        ← Previous
                      </Link>
                    </>
                  )}

                  {/* Page numbers - show 5 pages around current */}
                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                      let pageNum;
                      if (pages <= 5) {
                        pageNum = i + 1;
                      } else if (pageSafe <= 3) {
                        pageNum = i + 1;
                      } else if (pageSafe >= pages - 2) {
                        pageNum = pages - 4 + i;
                      } else {
                        pageNum = pageSafe - 2 + i;
                      }

                      return (
                        <Link
                          key={pageNum}
                          href={`/shop?${qs({ page: pageNum })}`}
                          className={`rounded-md px-3 py-2 text-sm font-medium ${
                            pageNum === pageSafe
                              ? "bg-primary text-primary-foreground"
                              : "border bg-card hover:bg-accent"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>

                  {pageSafe < pages && (
                    <>
                      <Link
                        href={`/shop?${qs({ page: pageSafe + 1 })}`}
                        className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                      >
                        Next →
                      </Link>
                      <Link
                        href={`/shop?${qs({ page: pages })}`}
                        className="rounded-md border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                        title="Last page"
                      >
                        »»
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Jump to page */}
              <PageJump
                currentPage={pageSafe}
                totalPages={pages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
