"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
}

interface Product {
  _id: string;
  title: string;
  slug?: string;
  price_amount: number;
  image?: string;
  brand?: string;
  category?: string;
}

export default function SearchAutocomplete({
  className = "",
  placeholder = "Search all products...",
}: SearchAutocompleteProps) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch suggestions when query changes
  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [q]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const product = suggestions[selectedIndex];
      router.push(`/product/${product.slug || product._id}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          autoComplete="off"
        />
        <button
          type="submit"
          className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Search
        </button>
      </form>

      {/* Suggestions Dropdown - Amazon-style */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[500px] overflow-y-auto rounded-lg border-2 border-primary/20 bg-popover shadow-2xl backdrop-blur-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-sm font-medium text-muted-foreground">Searching products...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">No products found for "{q}"</p>
              <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              <div className="border-b bg-muted/30 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {suggestions.length} {suggestions.length === 1 ? 'Product' : 'Products'} Found
                </p>
              </div>
              {suggestions.map((product, idx) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug || product._id}`}
                  onClick={() => setShowSuggestions(false)}
                  className={`flex items-center gap-4 border-b p-4 transition-all last:border-b-0 ${
                    idx === selectedIndex
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-accent border-l-4 border-l-transparent"
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {product.image ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold line-clamp-2 leading-tight">{product.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {product.brand && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{product.brand}</span>
                      )}
                      {product.category && (
                        <span className="rounded bg-muted px-1.5 py-0.5">{product.category}</span>
                      )}
                    </div>
                    <div className="mt-1.5 text-base font-bold text-primary">
                      ${((product.price_amount ?? 0) / 100).toFixed(2)}
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
              {suggestions.length > 0 && (
                <button
                  onClick={() => {
                    router.push(`/shop?q=${encodeURIComponent(q)}`);
                    setShowSuggestions(false);
                  }}
                  className="w-full border-t-2 bg-gradient-to-r from-primary/5 to-primary/10 p-4 text-center text-sm font-semibold text-primary transition-colors hover:from-primary/10 hover:to-primary/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>View all results for "{q}"</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
