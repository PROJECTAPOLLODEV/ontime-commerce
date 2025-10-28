"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface ShopFiltersProps {
  brands: string[];
  categories: string[];
  currentBrand: string;
  currentCategory: string;
  currentMin: number;
  currentMax: number;
  currentSort: string;
}

export default function ShopFilters({
  brands,
  categories,
  currentBrand,
  currentCategory,
  currentMin,
  currentMax,
  currentSort,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(currentMin || "");
  const [maxPrice, setMaxPrice] = useState(currentMax || "");
  const [showAllBrands, setShowAllBrands] = useState(false);

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/shop?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) {
      params.set("min", String(minPrice));
    } else {
      params.delete("min");
    }
    if (maxPrice) {
      params.set("max", String(maxPrice));
    } else {
      params.delete("max");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-card p-4">
      {/* Sort */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Category</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("category", undefined)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                !currentCategory
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                  currentCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Brand</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("brand", undefined)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                !currentBrand
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              All Brands
            </button>
            {(showAllBrands ? brands : brands.slice(0, 10)).map((brand) => (
              <button
                key={brand}
                onClick={() => updateFilter("brand", brand)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                  currentBrand === brand
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {brand}
              </button>
            ))}
            {brands.length > 10 && !showAllBrands && (
              <button
                onClick={() => setShowAllBrands(true)}
                className="w-full rounded-md border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Show {brands.length - 10} more brands
              </button>
            )}
            {brands.length > 10 && showAllBrands && (
              <button
                onClick={() => setShowAllBrands(false)}
                className="w-full rounded-md border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground">Min ($)</label>
            <input
              type="number"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground">Max ($)</label>
            <input
              type="number"
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="No limit"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
