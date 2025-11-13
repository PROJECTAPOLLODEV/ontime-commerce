"use client";

import Link from "next/link";
import { useState } from "react";
import CallForPricingModal from "./CallForPricingModal";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug?: string;
    price_amount: number;
    callForPricing?: boolean;
    image?: string;
    images?: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const imgSrc =
    product.image ||
    (Array.isArray(product.images) && product.images[0]) ||
    "/placeholder.png";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // If this is a call for pricing product, show the modal instead
    if (product.callForPricing) {
      setShowPricingModal(true);
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        // Trigger a cart update event so other components can refresh
        window.dispatchEvent(new Event("cart-updated"));

        // Reset after short delay to show success
        setTimeout(() => {
          setAdding(false);
        }, 1000);
      } else {
        alert("Failed to add to cart");
        setAdding(false);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Error adding to cart");
      setAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md">
      {/* Product Image - Clickable */}
      <Link href={`/product/${product.slug || product._id}`} className="aspect-square overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={product.title}
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-3">
        {/* Title - Clickable */}
        <Link href={`/product/${product.slug || product._id}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          {product.callForPricing ? (
            <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
              Call for Pricing
            </span>
          ) : (
            <span className="text-lg font-bold">
              ${((product.price_amount ?? 0) / 100).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button / Contact Button - NOT inside Link */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`mt-3 w-full rounded-md px-3 py-2 text-xs font-medium text-primary-foreground transition-colors disabled:opacity-50 ${
            adding ? "bg-green-600" : "bg-primary hover:opacity-90"
          }`}
        >
          {adding ? "✓ Added!" : product.callForPricing ? "Contact for Pricing" : "Add to Cart"}
        </button>
      </div>

      <CallForPricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        productTitle={product.title}
      />
    </div>
  );
}
