import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/shop",
  "/shop/(.*)",
  "/product/(.*)",
  "/cart",
  "/checkout",
  "/checkout/(.*)",
  "/success",
  "/cancel",
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
  "/sign-out",
  "/sign-out/(.*)",
  "/debug",
  // TEMPORARY WORKAROUND: Make admin/account public, protect at page level instead
  // Middleware auth() is broken with Next.js 15, so we use page-level protection
  "/admin",
  "/admin/(.*)",
  "/account",
  "/account/(.*)",
  // Clover sync/test pages and API routes
  "/clover-sync",
  "/clover-test",
  "/clover-token-test",
  "/clover-products-test",
  // debug/test while building
  "/api/ping",
  "/api/products",
  "/api/clover-sync",
  "/api/clover-token-test",
  "/api/clover-products-test",
  "/api/debug-auth",
  "/api/debug-user",
  "/api/check-keys",
  // Cart and checkout API routes (public for guest checkout)
  "/api/cart",
  "/api/cart/(.*)",
  "/api/checkout",
  "/api/checkout/(.*)",
  "/api/search",
  "/api/search/(.*)",
  // Admin API routes (protected at API level, not middleware)
  "/api/admin/(.*)",
  "/api/orders",
  "/api/orders/(.*)",
]);

const requiresAccount = createRouteMatcher(["/account(.*)"]);
const requiresAdmin   = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  const a = auth();
  const pathname = new URL(req.url).pathname;

  // Detailed debug logging for protected routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    console.log("🔍 Clerk auth() result:", {
      path: pathname,
      userId: a.userId || "NULL",
      sessionId: a.sessionId || "NULL",
      orgId: a.orgId || "NULL",
      hasSessionClaims: !!a.sessionClaims,
      sessionClaimsKeys: a.sessionClaims ? Object.keys(a.sessionClaims) : [],
    });
  }

  const role =
    (a.sessionClaims as any)?.publicMetadata?.role ??
    (a.sessionClaims as any)?.metadata?.role ??
    undefined;

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
    console.log("✅ Public route, allowing through:", pathname);
    return withDebug(NextResponse.next());
  }

  console.log("⚠️ NOT public route:", pathname, "isPublic:", isPublic(req));

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
