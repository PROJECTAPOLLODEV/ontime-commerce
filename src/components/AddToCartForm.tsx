"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CallForPricingModal from "./CallForPricingModal";

interface AddToCartFormProps {
  productId: string;
  callForPricing?: boolean;
  productTitle?: string;
}

export default function AddToCartForm({ productId, callForPricing, productTitle }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const router = useRouter();

  const handleAddToCart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If this is a call for pricing product, show the modal instead
    if (callForPricing) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (response.ok) {
        // Show success feedback
        alert("Added to cart successfully!");
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      alert(`Failed to add to cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddToCart} className="space-y-4">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center rounded-lg border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center border-r hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="h-10 w-16 border-0 bg-transparent text-center text-sm font-semibold outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center border-l hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                <span>Adding...</span>
              </>
            ) : callForPricing ? (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Contact for Pricing</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
          {!callForPricing && (
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-background px-6 py-3 text-base font-semibold text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Buy Now</span>
            </button>
          )}
        </div>
      </form>

      <CallForPricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        productTitle={productTitle}
      />

      {/* Features */}
      <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <span className="font-medium">Free Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="font-medium">Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="font-medium">Easy Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Fast Delivery</span>
        </div>
      </div>
    </div>
  );
}
