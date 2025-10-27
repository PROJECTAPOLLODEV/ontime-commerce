import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";


export default async function AdminProducts() {
await dbConnect();
const items = await Product.find({}).limit(100).lean();
return (
<div>
<h1 className="mb-4 text-2xl font-bold">Products</h1>
<table className="w-full text-sm">
<thead><tr className="border-b"><th className="py-2 text-left">Title</th><th>Price</th><th>SKU</th></tr></thead>
<tbody>
{items.map((p: any) => (
<tr key={p._id} className="border-b">
<td className="py-2">{p.title}</td>
<td>${(p.price?.amount ?? 0) / 100}</td>
<td>{p.inventory?.sku}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}