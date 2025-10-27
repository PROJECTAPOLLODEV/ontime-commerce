"use client";

import { useState, useEffect } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    brand: "",
    category: "",
    price_amount: "",
    compare_at_amount: "",
    image: "",
    images: "",
    clover_no: "",
    clover_type: "",
    color: "",
    yield: "",
    availability: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price_amount: Number(formData.price_amount) * 100, // convert to cents
      compare_at_amount: formData.compare_at_amount
        ? Number(formData.compare_at_amount) * 100
        : 0,
      images: formData.images ? formData.images.split(",").map((s) => s.trim()) : [],
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Product created successfully!");
      setFormData({
        title: "",
        slug: "",
        description: "",
        brand: "",
        category: "",
        price_amount: "",
        compare_at_amount: "",
        image: "",
        images: "",
        clover_no: "",
        clover_type: "",
        color: "",
        yield: "",
        availability: "",
      });
      setShowForm(false);
      loadProducts();
    } else {
      const error = await res.text();
      alert(`Error: ${error}`);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {showForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  placeholder="auto-generated if empty"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price_amount}
                  onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Compare At Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.compare_at_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, compare_at_amount: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Primary Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Additional Images (comma-separated URLs)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  placeholder="url1, url2, url3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Clover Item Number</label>
                <input
                  type="text"
                  value={formData.clover_no}
                  onChange={(e) => setFormData({ ...formData, clover_no: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Clover Type</label>
                <input
                  type="text"
                  value={formData.clover_type}
                  onChange={(e) => setFormData({ ...formData, clover_type: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Yield</label>
                <input
                  type="text"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Availability</label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Create Product
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Image</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Brand</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Item No.</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p._id} className="border-b">
                <td className="px-4 py-3">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                </td>
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.brand || "—"}</td>
                <td className="px-4 py-3 font-medium">
                  ${((p.price_amount ?? 0) / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.clover_no || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No products found. Add your first product above.
        </div>
      )}
    </div>
  );
}
