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

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {suggestions.map((product, idx) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug || product._id}`}
                  onClick={() => setShowSuggestions(false)}
                  className={`flex items-center gap-3 border-b p-3 transition-colors last:border-b-0 ${
                    idx === selectedIndex ? "bg-accent" : "hover:bg-accent"
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                    <div className="text-sm text-muted-foreground">
                      ${((product.price_amount ?? 0) / 100).toFixed(2)}
                    </div>
                  </div>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
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
                  className="w-full p-3 text-center text-sm font-medium text-primary hover:bg-accent"
                >
                  View all results for "{q}"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
