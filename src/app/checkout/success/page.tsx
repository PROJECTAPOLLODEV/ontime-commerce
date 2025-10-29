"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderCreated, setOrderCreated] = useState(false);
  const [creating, setCreating] = useState(true);

  useEffect(() => {
    // Create order when component mounts (for development without webhooks)
    if (sessionId && !orderCreated) {
      createOrder();
    }
  }, [sessionId]);

  const createOrder = async () => {
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Order created:", data.orderId);
        setOrderCreated(true);
      } else {
        console.error("Failed to create order");
      }
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border bg-card p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-10 w-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Thank you for your purchase
        </p>

        {creating && (
          <div className="mb-4 text-sm text-muted-foreground">
            Processing your order...
          </div>
        )}

        <div className="mb-8 rounded-md bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            We've sent a confirmation email with your order details.
          </p>
          {sessionId && (
            <p className="mt-2 text-xs font-mono text-muted-foreground">
              Session ID: {sessionId.substring(0, 24)}...
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium hover:bg-accent"
          >
            View Order
          </Link>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
