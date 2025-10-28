"use client";

import { useState, useEffect } from "react";

interface Product {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  brand?: string;
  category?: string;
  price_amount: number;
  compare_at_amount?: number;
  image?: string;
  images?: string[];
  clover_no?: string;
  clover_type?: string;
  color?: string;
  yield?: string;
  availability?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>({});
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

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(editingId ? "Product updated successfully!" : "Product created successfully!");
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
      setEditingId(null);
      loadProducts();
    } else {
      const error = await res.text();
      alert(`Error: ${error}`);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      slug: product.slug || "",
      description: product.description || "",
      brand: product.brand || "",
      category: product.category || "",
      price_amount: ((product.price_amount || 0) / 100).toString(),
      compare_at_amount: product.compare_at_amount
        ? (product.compare_at_amount / 100).toString()
        : "",
      image: product.image || "",
      images: product.images?.join(", ") || "",
      clover_no: product.clover_no || "",
      clover_type: product.clover_type || "",
      color: product.color || "",
      yield: product.yield || "",
      availability: product.availability || "",
    });
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Product deleted successfully!");
        loadProducts();
      } else {
        const error = await res.text();
        alert(`Error deleting product: ${error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handlePriceChange = async (id: string, currentPrice: number) => {
    const priceInDollars = editingPrice[id];
    if (!priceInDollars || priceInDollars === "") {
      alert("Please enter a valid price");
      return;
    }

    const priceInCents = Math.round(Number(priceInDollars) * 100);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_amount: priceInCents }),
      });

      if (res.ok) {
        alert("Price updated successfully!");
        setEditingPrice((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
        loadProducts();
      } else {
        const error = await res.text();
        alert(`Error updating price: ${error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const cancelEdit = () => {
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
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => {
            if (showForm) {
              cancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {showForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            {editingId ? "Edit Product" : "Create New Product"}
          </h2>
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

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel Edit
                </button>
              )}
            </div>
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
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b hover:bg-muted/50">
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {editingPrice[p._id] !== undefined ? (
                      <>
                        <span className="text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editingPrice[p._id]}
                          onChange={(e) =>
                            setEditingPrice({ ...editingPrice, [p._id]: e.target.value })
                          }
                          className="w-24 rounded border bg-background px-2 py-1 text-sm"
                          placeholder="0.00"
                        />
                        <button
                          onClick={() => handlePriceChange(p._id, p.price_amount)}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() =>
                            setEditingPrice((prev) => {
                              const newState = { ...prev };
                              delete newState[p._id];
                              return newState;
                            })
                          }
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">
                          ${((p.price_amount ?? 0) / 100).toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            setEditingPrice({
                              ...editingPrice,
                              [p._id]: ((p.price_amount ?? 0) / 100).toString(),
                            })
                          }
                          className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.clover_no || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.title)}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
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
