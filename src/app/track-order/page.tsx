"use client";

import { useState } from "react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  email: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  createdAt: string;
}

const fulfillmentStages = [
  { key: "order_received", label: "Order Received" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDetails, setExpandedDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found. Please check your order number and email.");
      }
    } catch (err) {
      setError("Failed to look up order. Please try again.");
    }

    setLoading(false);
  };

  const getFulfillmentStageIndex = (status: string) => {
    return fulfillmentStages.findIndex((s) => s.key === status);
  };

  const getFulfillmentStatusColor = (status: string) => {
    if (status === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (status === "delivered") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your order number and email to track your order status
        </p>
      </div>

      {/* Order Lookup Form */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
              Order Number
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g., ABC12345"
              className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              You can find your order number in your confirmation email
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Looking up order..." : "Track Order"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/account" className="text-sm text-primary hover:underline">
            Have an account? Sign in to view all orders
          </Link>
        </div>
      </div>

      {/* Order Details */}
      {order && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 border-b pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getFulfillmentStatusColor(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment Progress Tracker */}
          {order.fulfillmentStatus !== "cancelled" && (
            <div className="mb-6 rounded-lg bg-muted/30 p-6">
              <h3 className="mb-4 text-sm font-semibold">Order Status</h3>
              <div className="flex items-center justify-between">
                {fulfillmentStages.map((stage, idx) => {
                  const currentStageIndex = getFulfillmentStageIndex(order.fulfillmentStatus);
                  return (
                    <div key={stage.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                          idx <= currentStageIndex
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {idx < currentStageIndex ? "✓" : idx + 1}
                        </div>
                        <div className="mt-2 text-center text-xs font-medium hidden sm:block">
                          {stage.label}
                        </div>
                      </div>
                      {idx < fulfillmentStages.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          idx < currentStageIndex ? "bg-primary" : "bg-muted"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 rounded-lg bg-muted/30 p-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${(item.price / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-medium">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="mb-4 w-full text-center text-sm text-primary hover:underline"
          >
            {expandedDetails ? "Hide Details" : "Show More Details"}
          </button>

          {expandedDetails && (
            <div className="space-y-4 border-t pt-4">
              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="rounded-lg bg-muted/30 p-4">
                  <h3 className="mb-2 text-sm font-semibold">Shipping Address</h3>
                  <div className="text-sm">
                    <div>{order.shippingAddress.name}</div>
                    <div>{order.shippingAddress.line1}</div>
                    {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="rounded-lg bg-muted/30 p-4">
                <h3 className="mb-2 text-sm font-semibold">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(order.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shipping === 0 ? "FREE" : `$${(order.shipping / 100).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(order.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total</span>
                    <span>${(order.amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
