import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

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

  const total = await Product.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / size));
  const pageSafe = Math.min(page, pages);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageSafe - 1) * size)
    .limit(size)
    .lean();

  const qs = (overrides: Partial<SearchParams>) => {
    const base = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(brand ? { brand } : {}),
      ...(category ? { category } : {}),
      ...(min ? { min: String(min) } : {}),
      ...(max ? { max: String(max) } : {}),
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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold">Shop</h1>

      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p: any) => {
          const imgSrc =
            p.image ||
            (Array.isArray(p.images) && p.images[0]) ||
            (Array.isArray(p.imagesDetails) && p.imagesDetails[0]?.url) ||
            "/placeholder.png";

          return (
            <Link
              key={p._id}
              href={`/product/${p.slug || p._id}`}
              className="rounded-md border p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={p.title}
                className="aspect-square w-full rounded object-contain bg-white"
              />
              <div className="mt-2 text-sm font-medium line-clamp-2">{p.title}</div>
              <div className="text-sm text-muted-foreground">
                ${(p.price_amount ?? 0) / 100}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pageSafe} / {pages} — {total} results
        </div>
        <div className="flex gap-2">
          {pageSafe > 1 && (
            <Link
              href={`/shop?${qs({ page: pageSafe - 1 })}`}
              className="rounded border px-3 py-1 text-sm"
            >
              Prev
            </Link>
          )}
          {pageSafe < pages && (
            <Link
              href={`/shop?${qs({ page: pageSafe + 1 })}`}
              className="rounded border px-3 py-1 text-sm"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
