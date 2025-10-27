import { currentUser } from "@clerk/nextjs/server";

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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
        <h2 className="text-2xl font-bold">Welcome back, {user.firstName}!</h2>
        <p className="mt-1 text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/products"
          className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
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
          className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
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
          className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
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
      </div>

      {/* Help Section */}
      <div className="rounded-lg border bg-muted/30 p-6">
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
