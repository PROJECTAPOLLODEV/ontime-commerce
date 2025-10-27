import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/site/product-card";

export default async function ShopPage() {
  await dbConnect();
  const products = await Product.find({}).limit(48).lean();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Shop All</h1>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p: any) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
