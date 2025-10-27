import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <p className="text-sm font-semibold">OnTime Commerce</p>
            <p className="text-xs text-muted-foreground">
              Industrial-grade stainless boards, carts, signage & more.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-foreground">Shop</Link>
            <Link href="/account" className="hover:text-foreground">Account</Link>
            <Link href="/admin" className="hover:text-foreground">Admin</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </nav>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} OnTime Commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
