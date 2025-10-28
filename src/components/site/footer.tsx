import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold">OnTime Commerce</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your trusted partner for quality industrial products, office supplies, and imaging solutions.
              Fast shipping, competitive prices, and exceptional service.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="mailto:support@example.com"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Email"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a
                href="tel:+1234567890"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Phone"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/shop" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=HP" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  HP Products
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Canon" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Canon Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/account" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  My Account
                </Link>
              </li>
              <li>
                <a href="mailto:support@example.com" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} OnTime Commerce. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
