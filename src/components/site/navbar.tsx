"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import ThemeToggle from "@/components/site/theme-toggle";
import SiteLogo from "@/components/site/site-logo";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata as any)?.role;
  const isAdmin = role === "admin";
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Brand (image with text fallback) */}
        <SiteLogo className="min-w-0" />

        {/* Search (desktop) */}
        <form action="/shop" method="GET" className="ml-3 hidden flex-1 items-center gap-2 md:flex" role="search">
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search all products..."
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Search
          </button>
          <Link href="/shop?brand=" className="text-sm text-muted-foreground hover:text-foreground">
            Brands
          </Link>
        </form>

        {/* Right side */}
        <nav className="ml-auto flex items-center gap-3">
          <NavLink href="/shop" active={pathname?.startsWith("/shop")}>Shop</NavLink>
          <NavLink href="/cart" active={pathname === "/cart"}>Cart</NavLink>

          <SignedIn>
            <NavLink href="/account" active={pathname?.startsWith("/account")}>Account</NavLink>
            {isAdmin && <NavLink href="/admin" active={pathname?.startsWith("/admin")}>Admin</NavLink>}
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }} />
            <SignOutButton redirectUrl="/">
              <button className="rounded-md border px-3 py-1 text-sm hover:bg-accent">Sign out</button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal" signUpUrl="/sign-up">
              <button className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:opacity-90">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <ThemeToggle />
        </nav>
      </div>

      {/* Mobile search */}
      <div className="mx-auto block w-full border-t px-4 py-2 sm:px-6 md:hidden">
        <form action="/shop" method="GET" className="flex items-center gap-2">
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search all products..."
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-2 py-1 text-sm transition-colors",
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
