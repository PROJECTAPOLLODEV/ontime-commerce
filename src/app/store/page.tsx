import { dbConnect } from "@/lib/db";
import Banner from "@/models/Banner";
import Product from "@/models/Product";
import ProductCard from "@/components/site/product-card";
import Link from "next/link";


export default async function HomePage() {
await dbConnect();
const banner = await Banner.findOne().lean();
const featured = await Product.find({}).sort({ createdAt: -1 }).limit(8).lean();
return (
<div className="space-y-10">
<section className="grid gap-6 rounded-2xl bg-muted p-8 md:grid-cols-2">
<div>
<div className="mb-2 text-sm text-muted-foreground">Best Quality Products</div>
<h1 className="text-4xl font-bold tracking-tight">{banner?.title ?? "Discover amazing variety of products"}</h1>
<p className="mt-3 text-muted-foreground">{banner?.subtitle ?? "Custom Solutions. Nationwide Reach. Always On Time."}</p>
<Link href={banner?.ctaHref ?? "/shop"} className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">{banner?.ctaLabel ?? "Shop Now"}</Link>
</div>
<div className="aspect-[16/9] rounded-xl bg-secondary/50" style={{ backgroundImage: `url(${banner?.image ?? ""})`, backgroundSize: "cover" }} />
</section>


<section>
<h2 className="mb-4 text-2xl font-semibold">Featured</h2>
<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
{featured.map((p: any) => (
<ProductCard key={p._id} product={p} />
))}
</div>
</section>
</div>
);
}