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

  // Features (use from settings if available, otherwise defaults)
  const features = settings?.homepage?.features && settings.homepage.features.length > 0
    ? settings.homepage.features
    : [
        { title: "Free Shipping", description: "On orders over $100", icon: "shipping" },
        { title: "Secure Payment", description: "100% secure transactions", icon: "payment" },
        { title: "Easy Returns", description: "30-day return policy", icon: "returns" },
        { title: "24/7 Support", description: "Always here to help", icon: "support" },
      ];

  // Pick featured products: explicit list → otherwise latest 8
  const featured = featuredIds.length
    ? await Product.find({ _id: { $in: featuredIds } }).lean()
    : await Product.find({}).sort({ createdAt: -1 }).limit(8).lean();

  return (
    <>
      {/* Hero Banner - Modern & Sleek */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="relative h-[500px] md:h-[600px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerImage}
            alt="OnTime Commerce banner"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Premium Quality Products</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              {bannerHeading}
            </h1>
            <p className="mt-6 text-lg text-white/90 md:text-xl max-w-2xl mx-auto">
              {bannerSub}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-2xl transition-all hover:bg-primary/90 hover:scale-105"
              >
                <span>Shop Now</span>
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/shop?featured=true"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <span>Browse Categories</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-3 gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">10k+</div>
                <div className="mt-1 text-sm text-white/80">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">99%</div>
                <div className="mt-1 text-sm text-white/80">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">24/7</div>
                <div className="mt-1 text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {features.map((feature: any, index: number) => {
              const iconPaths = {
                shipping: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
                payment: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                returns: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                support: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
              };
              const iconPath = iconPaths[feature.icon as keyof typeof iconPaths] || iconPaths.shipping;

              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Collection
          </div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Highlighted Products</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Carefully selected products just for you
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p: any) => (
            <ProductCard key={String(p._id)} product={p} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-background px-6 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <span>View All Products</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Brand Logos */}
      {logos.length > 0 && (
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold md:text-2xl">Trusted Brands</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We partner with industry-leading brands
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-8 md:grid-cols-6">
              {logos.map((src, i) => {
                const logoSrc = resolveImage(src);
                return (
                  <div
                    key={`${logoSrc}-${i}`}
                    className="flex items-center justify-center rounded-lg border bg-background p-4 transition-all hover:shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoSrc}
                      alt="brand"
                      className="h-12 w-full object-contain grayscale transition-all hover:grayscale-0"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover thousands of quality products at competitive prices
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
            >
              <span>Browse Products</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-background px-8 py-4 font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
