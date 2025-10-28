"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    }
    setLoading(false);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || items.length === 0) {
      alert("Please enter your email and ensure you have items in your cart");
      return;
    }

    setProcessing(true);

    try {
      // Create Stripe checkout session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error("No checkout URL received");
      }

      // Redirect to Stripe Checkout using the session URL
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert(`Checkout failed: ${err.message}`);
      setProcessing(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-lg border bg-card p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some products before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Checkout Form */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="your@email.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                We'll send your order confirmation here
              </p>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                You'll be redirected to Stripe's secure checkout to complete your payment.
              </p>
            </div>

            <button
              type="submit"
              disabled={processing || !email}
              className="w-full rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Continue to Payment"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

            <div className="space-y-3 border-b pb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at next step</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>Calculated at next step</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                ${(subtotal / 100).toFixed(2)}
              </span>
            </div>

            <Link
              href="/cart"
              className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
