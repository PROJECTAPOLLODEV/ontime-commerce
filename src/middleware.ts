import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/shop",
  "/product(.*)",
  "/cart",
  "/checkout",
  "/success",
  "/cancel",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-out(.*)",
  // debug/test while building
  "/api/ping",
  "/api/products",
  "/api/clover-sync",
  "/api/clover-token-test",
  "/api/clover-products-test",
  "/api/debug-auth",
  "/api/debug-user",
]);

const requiresAccount = createRouteMatcher(["/account(.*)"]);
const requiresAdmin   = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  const a = auth();
  const role =
    (a.sessionClaims as any)?.publicMetadata?.role ??
    (a.sessionClaims as any)?.metadata?.role ??
    undefined;

  // Helper to stamp debug headers on a response
  const withDebug = (res: NextResponse) => {
    res.headers.set("x-mw-path", new URL(req.url).pathname);
    res.headers.set("x-mw-public", String(isPublic(req)));
    res.headers.set("x-mw-user", String(a.userId ?? "null"));
    res.headers.set("x-mw-role", String(role ?? "none"));
    return res;
  };

  // Public routes → straight through
  if (isPublic(req)) {
    return withDebug(NextResponse.next());
  }

  // Prefer Clerk's built-in guard
  // @ts-ignore
  if (typeof (a as any).protect === "function") {
    // @ts-ignore
    const maybe = (a as any).protect();
    if (maybe) return withDebug(maybe);
  } else {
    // Manual guard for older Clerk
    if (!a.userId) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("redirect_url", req.url);
      return withDebug(NextResponse.redirect(url));
    }
  }

  // Admin gate
  if (requiresAdmin(req)) {
    if (role !== "admin") {
      const res = new NextResponse("Forbidden (admin only)", { status: 403 });
      return withDebug(res);
    }
  }

  // Account requires sign-in only (already ensured)
  return withDebug(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
