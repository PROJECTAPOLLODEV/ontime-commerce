// src/app/page.tsx
import { dbConnect } from "@/lib/db";
import Setting from "@/models/Setting";
import Product from "@/models/Product";
import Link from "next/link";
import ProductCard from "@/components/site/product-card";

export const dynamic = "force-dynamic";

function resolveImage(src?: string): string {
  // Accepts:
  // - local path: "home-hero.jpg" or "/home-hero.jpg"
  // - remote URL: "https://…"
  if (!src || typeof src !== "string") return "/placeholder.png";
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  // Ensure local images always start with a leading slash so Next serves from /public
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export default async function HomePage() {
  await dbConnect();

  const settings = await Setting.findOne({}).lean();
  const featuredIds: string[] = settings?.homepage?.featuredProductIds ?? [];

  // Banner content (supports local files in /public or full URLs)
  const bannerImage = resolveImage(settings?.homepage?.bannerImage || "hero.jpg");
  const bannerHeading = settings?.homepage?.bannerHeading || "Your Industrial Partner";
  const bannerSub = settings?.homepage?.bannerSub || "Quality signage & materials, built for tough environments.";
  const logos: string[] = settings?.homepage?.brandLogos ?? [];

  // Pick featured products: explicit list → otherwise latest 8
  const featured = featuredIds.length
    ? await Product.find({ _id: { $in: featuredIds } }).lean()
    : await Product.find({}).sort({ createdAt: -1 }).limit(8).lean();

  return (
    <>
      {/* Banner (local-friendly) */}
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerImage}
          alt="OnTime Commerce banner"
          className="h-72 w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-auto max-w-3xl px-4 text-center text-white">
            <h1 className="text-3xl font-bold md:text-4xl">{bannerHeading}</h1>
            <p className="mt-2 text-white/90">{bannerSub}</p>
            <div className="mt-4">
              <Link
                href="/shop"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Highlighted Products</h2>
        <p className="text-sm text-muted-foreground">Rotated weekly from Admin</p>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {featured.map((p: any) => (
            <ProductCard key={String(p._id)} product={p} />
          ))}
        </div>
      </section>

      {/* Brand logos */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h3 className="text-lg font-medium">Brands we support</h3>
        {logos.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Add logos in Admin → Homepage.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4 md:grid-cols-6">
            {logos.map((src, i) => {
              const logoSrc = resolveImage(src);
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${logoSrc}-${i}`}
                  src={logoSrc}
                  alt="brand"
                  className="h-12 w-full object-contain grayscale"
                  loading="lazy"
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
