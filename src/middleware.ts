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
  "/debug",
  // debug/test while building
  "/api/ping",
  "/api/products",
  "/api/clover-sync",
  "/api/clover-token-test",
  "/api/clover-products-test",
  "/api/debug-auth",
  "/api/debug-user",
  "/api/check-keys",
]);

const requiresAccount = createRouteMatcher(["/account(.*)"]);
const requiresAdmin   = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  const a = auth();
  const role =
    (a.sessionClaims as any)?.publicMetadata?.role ??
    (a.sessionClaims as any)?.metadata?.role ??
    undefined;

  const pathname = new URL(req.url).pathname;

  // Helper to stamp debug headers on a response
  const withDebug = (res: NextResponse) => {
    res.headers.set("x-mw-path", pathname);
    res.headers.set("x-mw-public", String(isPublic(req)));
    res.headers.set("x-mw-user", String(a.userId ?? "null"));
    res.headers.set("x-mw-role", String(role ?? "none"));
    return res;
  };

  // Debug logging for admin routes
  if (pathname.startsWith("/admin")) {
    console.log("🔍 Middleware /admin:", {
      path: pathname,
      userId: a.userId ? "EXISTS" : "NULL",
      role: role || "NONE",
      isPublic: isPublic(req),
      requiresAdmin: requiresAdmin(req),
    });
  }

  // Public routes → straight through
  if (isPublic(req)) {
    return withDebug(NextResponse.next());
  }

  // Check if user is signed in
  if (!a.userId) {
    console.log("❌ No userId, redirecting to sign-in");
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.url);
    return withDebug(NextResponse.redirect(url));
  }

  // Admin gate - check role BEFORE any other redirects
  if (requiresAdmin(req)) {
    if (role !== "admin") {
      console.log("❌ Admin required but role is:", role, "- redirecting to home");
      const url = new URL("/", req.url);
      return withDebug(NextResponse.redirect(url));
    }
    console.log("✅ Admin access granted");
  }

  // All other protected routes → user is signed in, allow through
  return withDebug(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
