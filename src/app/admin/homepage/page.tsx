"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface BrandLogo {
  lightUrl: string;
  darkUrl: string;
}

interface HomepageSettings {
  bannerImage: string;
  bannerHeading: string;
  bannerSub: string;
  featuredProductIds: string[];
  brandLogos: BrandLogo[];
  features: Feature[];
}

interface Product {
  _id: string;
  title: string;
  image?: string;
  price_amount?: number;
}

const defaultFeatures: Feature[] = [
  { title: "Free Shipping", description: "On orders over $100", icon: "shipping" },
  { title: "Secure Payment", description: "100% secure transactions", icon: "payment" },
  { title: "Easy Returns", description: "30-day return policy", icon: "returns" },
  { title: "24/7 Support", description: "Always here to help", icon: "support" },
];

export default function HomepageAdminPage() {
  const [settings, setSettings] = useState<HomepageSettings>({
    bannerImage: "",
    bannerHeading: "",
    bannerSub: "",
    featuredProductIds: [],
    brandLogos: [],
    features: defaultFeatures,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState<{ index: number; type: "light" | "dark" } | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
    loadProducts();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/homepage");
      if (res.ok) {
        const data = await res.json();

        // Migrate old string-based logos to new object format (just in case)
        let logos = data.brandLogos || [];
        if (logos.length > 0 && typeof logos[0] === "string") {
          logos = logos.map((url: string) => ({
            lightUrl: url,
            darkUrl: url,
          }));
        }

        setSettings({
          bannerImage: data.bannerImage || "",
          bannerHeading: data.bannerHeading || "Your Industrial Partner",
          bannerSub: data.bannerSub || "Quality signage & materials",
          featuredProductIds: data.featuredProductIds || [],
          brandLogos: logos,
          features: data.features && data.features.length > 0 ? data.features : defaultFeatures,
        });
        setSelectedProducts(data.featuredProductIds || []);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          featuredProductIds: selectedProducts,
        }),
      });

      if (res.ok) {
        alert("Homepage settings saved successfully!");
        router.refresh();
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err: any) {
      console.error("Error saving settings:", err);
      alert(`Failed to save: ${err.message}`);
    }
    setSaving(false);
  };

  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const addBrandLogo = () => {
    const newLogo: BrandLogo = { lightUrl: "", darkUrl: "" };
    setSettings({
      ...settings,
      brandLogos: [...settings.brandLogos, newLogo],
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, type: "light" | "dark") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ index, type });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();

      // Update the specific logo URL
      const newLogos = [...settings.brandLogos];
      if (type === "light") {
        newLogos[index].lightUrl = data.url;
      } else {
        newLogos[index].darkUrl = data.url;
      }

      setSettings({
        ...settings,
        brandLogos: newLogos,
      });

      // Clear the file input
      e.target.value = "";

      alert(`${type === "light" ? "Light" : "Dark"} logo uploaded successfully!`);
    } catch (err: any) {
      console.error("Error uploading logo:", err);
      alert(`Upload failed: ${err.message}`);
    }
    setUploading(null);
  };

  const updateLogoUrl = (index: number, type: "light" | "dark", url: string) => {
    const newLogos = [...settings.brandLogos];
    if (type === "light") {
      newLogos[index].lightUrl = url;
    } else {
      newLogos[index].darkUrl = url;
    }
    setSettings({
      ...settings,
      brandLogos: newLogos,
    });
  };

  const removeBrandLogo = (index: number) => {
    setSettings({
      ...settings,
      brandLogos: settings.brandLogos.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...settings.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setSettings({ ...settings, features: newFeatures });
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Homepage Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize your homepage content and featured products
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            ← Back to Admin
          </Link>
        </div>

        <div className="space-y-6">
          {/* Banner Section */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Hero Banner</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Banner Image URL</label>
                <input
                  type="text"
                  value={settings.bannerImage}
                  onChange={(e) => setSettings({ ...settings, bannerImage: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="https://example.com/image.jpg or /hero.jpg"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use a full URL or a path to a file in /public
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Heading</label>
                <input
                  type="text"
                  value={settings.bannerHeading}
                  onChange={(e) => setSettings({ ...settings, bannerHeading: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Your Industrial Partner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Subtitle</label>
                <textarea
                  value={settings.bannerSub}
                  onChange={(e) => setSettings({ ...settings, bannerSub: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Quality signage & materials, built for tough environments."
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Features Section</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Edit the 4 feature cards that appear below the hero banner
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {settings.features.map((feature, index) => (
                <div key={index} className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Feature {index + 1}
                    </span>
                    <select
                      value={feature.icon}
                      onChange={(e) => updateFeature(index, "icon", e.target.value)}
                      className="rounded border bg-background px-2 py-1 text-xs"
                    >
                      <option value="shipping">Shipping</option>
                      <option value="payment">Payment</option>
                      <option value="returns">Returns</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, "title", e.target.value)}
                    className="mb-2 w-full rounded border bg-background px-2 py-1 text-sm font-semibold"
                    placeholder="Feature Title"
                  />
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, "description", e.target.value)}
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    placeholder="Feature Description"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Featured Products</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Select products to highlight on the homepage ({selectedProducts.length} selected)
            </p>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-4">
              {filteredProducts.map((product) => (
                <label
                  key={product._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                    selectedProducts.includes(product._id)
                      ? "border-primary bg-primary/10"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => toggleProduct(product._id)}
                    className="h-4 w-4 rounded"
                  />
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                    {product.price_amount && (
                      <div className="text-sm text-muted-foreground">
                        ${(product.price_amount / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Logos */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Brand Logos (Light & Dark Mode)</h2>
              <button
                onClick={addBrandLogo}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                + Add Brand Logo
              </button>
            </div>
            {settings.brandLogos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No brand logos added yet. Click "Add Brand Logo" to get started.
              </p>
            ) : (
              <div className="space-y-6">
                {settings.brandLogos.map((logo, index) => (
                  <div key={index} className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">Brand Logo #{index + 1}</h3>
                      <button
                        onClick={() => removeBrandLogo(index)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-sm text-destructive-foreground hover:opacity-90"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Light Mode Logo */}
                      <div className="rounded-lg border bg-background p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                          </svg>
                          <span className="text-sm font-semibold">Light Mode</span>
                        </div>
                        {logo.lightUrl && (
                          <div className="mb-2 flex h-20 items-center justify-center rounded border bg-white">
                            <img src={logo.lightUrl} alt="Light logo" className="max-h-16 max-w-full object-contain" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={logo.lightUrl}
                            onChange={(e) => updateLogoUrl(index, "light", e.target.value)}
                            placeholder="Enter light logo URL"
                            className="w-full rounded border bg-background px-2 py-1.5 text-xs"
                          />
                          <label
                            htmlFor={`light-upload-${index}`}
                            className={`block cursor-pointer rounded border bg-primary px-2 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90 ${
                              uploading?.index === index && uploading?.type === "light" ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            {uploading?.index === index && uploading?.type === "light" ? "Uploading..." : "Upload Light Logo"}
                          </label>
                          <input
                            id={`light-upload-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, index, "light")}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Dark Mode Logo */}
                      <div className="rounded-lg border bg-background p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                          </svg>
                          <span className="text-sm font-semibold">Dark Mode</span>
                        </div>
                        {logo.darkUrl && (
                          <div className="mb-2 flex h-20 items-center justify-center rounded border bg-gray-900">
                            <img src={logo.darkUrl} alt="Dark logo" className="max-h-16 max-w-full object-contain" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={logo.darkUrl}
                            onChange={(e) => updateLogoUrl(index, "dark", e.target.value)}
                            placeholder="Enter dark logo URL"
                            className="w-full rounded border bg-background px-2 py-1.5 text-xs"
                          />
                          <label
                            htmlFor={`dark-upload-${index}`}
                            className={`block cursor-pointer rounded border bg-primary px-2 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90 ${
                              uploading?.index === index && uploading?.type === "dark" ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            {uploading?.index === index && uploading?.type === "dark" ? "Uploading..." : "Upload Dark Logo"}
                          </label>
                          <input
                            id={`dark-upload-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, index, "dark")}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 rounded-xl border bg-card p-6">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg border px-6 py-2.5 font-medium hover:bg-accent"
            >
              Preview Homepage
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
