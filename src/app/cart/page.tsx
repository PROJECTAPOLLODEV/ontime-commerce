"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
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

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(productId);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.ok) {
        await loadCart();
      } else {
        alert("Failed to update quantity");
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      alert("Error updating cart");
    }

    setUpdating(null);
  };

  const removeItem = async (productId: string) => {
    if (!confirm("Remove this item from your cart?")) return;

    setUpdating(productId);

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        await loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        alert("Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Error removing item");
    }

    setUpdating(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Link
          href="/shop"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some products to get started!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-lg border bg-card p-4"
              >
                {/* Product Image */}
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-white">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={updating === item.productId}
                      className="text-sm text-destructive hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={
                          item.quantity <= 1 || updating === item.productId
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={updating === item.productId}
                        className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        ${(item.price / 100).toFixed(2)} each
                      </div>
                      <div className="text-lg font-bold">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-b pb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-md bg-primary px-6 py-3 text-center font-medium text-primary-foreground hover:opacity-90"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
