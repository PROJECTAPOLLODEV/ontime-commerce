import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  const role = (user?.publicMetadata as any)?.role;

  if (!user) return null; // middleware handles redirect
  if (role !== "admin") {
    return <div className="text-sm text-muted-foreground">Admin only.</div>;
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
