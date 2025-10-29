"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const { user, isLoaded } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const router = useRouter();

  useEffect(() => {
    loadCart();
    if (isLoaded && user) {
      setEmail(user.primaryEmailAddress?.emailAddress || "");
      setShippingAddress((prev) => ({
        ...prev,
        name: user.fullName || "",
      }));
    }
  }, [isLoaded, user]);

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

    if (!shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.postalCode) {
      alert("Please fill in all required shipping address fields");
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
          shippingAddress,
          userId: user?.id || null,
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

  // Flat rate shipping: $15 for orders under $100, free over $100
  const shipping = subtotal >= 10000 ? 0 : 1500; // in cents

  // Flat tax rate: 8.5%
  const tax = Math.round(subtotal * 0.085);

  const total = subtotal + shipping + tax;

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
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
            <form onSubmit={handleCheckout} id="checkout-form" className="space-y-4">
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
            </form>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  form="checkout-form"
                  type="text"
                  required
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Address Line 1 <span className="text-destructive">*</span>
                </label>
                <input
                  form="checkout-form"
                  type="text"
                  required
                  value={shippingAddress.line1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Address Line 2</label>
                <input
                  form="checkout-form"
                  type="text"
                  value={shippingAddress.line2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  placeholder="Apt 4B (optional)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">
                    City <span className="text-destructive">*</span>
                  </label>
                  <input
                    form="checkout-form"
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    State <span className="text-destructive">*</span>
                  </label>
                  <input
                    form="checkout-form"
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">
                    ZIP Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    form="checkout-form"
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Country</label>
                  <select
                    form="checkout-form"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  >
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border bg-card p-6">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                You'll be redirected to Stripe's secure checkout to complete your payment.
              </p>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={processing || !email}
              className="mt-4 w-full rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-lg border bg-card p-6 sticky top-4">
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
                <span>{shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.5%)</span>
                <span>${(tax / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                ${(total / 100).toFixed(2)}
              </span>
            </div>

            {subtotal < 10000 && (
              <div className="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                Add ${((10000 - subtotal) / 100).toFixed(2)} more for free shipping!
              </div>
            )}

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
