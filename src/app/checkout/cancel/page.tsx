import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border bg-card p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <svg
            className="h-10 w-10 text-orange-600 dark:text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Checkout Cancelled</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Your order was not completed
        </p>

        <div className="mb-8 rounded-md bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Don't worry! Your items are still in your cart and ready when you are.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Return to Cart
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium hover:bg-accent"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
