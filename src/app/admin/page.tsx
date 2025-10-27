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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welcome, {user.firstName}!</h2>
        <p className="text-muted-foreground">Manage your e-commerce store from this admin panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/products"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <h3 className="mb-2 text-lg font-semibold">Products</h3>
          <p className="text-sm text-muted-foreground">
            Add, edit, and manage your product catalog. Match Clover product structure.
          </p>
        </a>

        <a
          href="/admin/orders"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <h3 className="mb-2 text-lg font-semibold">Orders</h3>
          <p className="text-sm text-muted-foreground">
            View all customer orders and order details.
          </p>
        </a>

        <a
          href="/admin/settings"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <h3 className="mb-2 text-lg font-semibold">Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure global markup, homepage banner, and site settings.
          </p>
        </a>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-2 font-semibold">Quick Stats</h3>
        <p className="text-sm text-muted-foreground">
          Use the navigation above to access different admin sections.
        </p>
      </div>
    </div>
  );
}
