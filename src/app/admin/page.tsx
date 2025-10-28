import { currentUser } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  const role = (user?.publicMetadata as any)?.role;

  // Debug output
  console.log("Admin Page - User:", user ? user.id : "null");
  console.log("Admin Page - Role:", role);

  if (!user) {
    return (
      <div className="rounded-lg border bg-yellow-50 p-6 dark:bg-yellow-900/20">
        <h2 className="text-lg font-semibold">Debug: No User Found</h2>
        <p className="text-sm">currentUser() returned null</p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="rounded-lg border bg-yellow-50 p-6 dark:bg-yellow-900/20">
        <h2 className="text-lg font-semibold">Debug: Not Admin</h2>
        <p className="text-sm">Role: {role || "undefined"}</p>
        <p className="text-sm">User ID: {user.id}</p>
        <pre className="mt-2 text-xs">{JSON.stringify(user.publicMetadata, null, 2)}</pre>
      </div>
    );
  }

  // Get statistics
  await dbConnect();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const recentProducts = await Product.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-sm">
        <h2 className="text-3xl font-bold">Welcome back, {user.firstName}!</h2>
        <p className="mt-2 text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-background p-6 shadow-sm transition-all hover:shadow-md dark:from-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="mt-2 text-3xl font-bold">{totalProducts.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-50 to-background p-6 shadow-sm transition-all hover:shadow-md dark:from-green-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="mt-2 text-3xl font-bold">{totalOrders.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50 to-background p-6 shadow-sm transition-all hover:shadow-md dark:from-purple-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
              <p className="mt-2 text-3xl font-bold">{recentProducts.length}</p>
              <p className="text-xs text-muted-foreground">new products</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Products</h2>
            <Link href="/admin/products" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.map((product: any) => (
              <div key={String(product._id)} className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4 transition-all hover:bg-muted/50">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${((product.price_amount || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <Link
                  href={`/admin/products`}
                  className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <a
          href="/admin/products"
          className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">
            Products
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your product catalog, pricing, and inventory
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary">
            Manage Products
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a
          href="/admin/orders"
          className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">
            Orders
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage customer orders and transactions
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary">
            View Orders
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a
          href="/admin/settings"
          className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <svg
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">
            Settings
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure pricing, homepage, and store settings
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary">
            Manage Settings
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a
          href="/admin/sync"
          className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <svg
                className="h-6 w-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">
            Clover Sync
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sync products from Clover API to your database
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary">
            Sync Products
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>
      </div>

      {/* Help Section */}
      <div className="rounded-xl border bg-gradient-to-br from-muted/50 to-background p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Getting Started</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the navigation tabs above to manage different aspects of your store.
              Start by adding products, configuring your pricing markup, or customizing your homepage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
