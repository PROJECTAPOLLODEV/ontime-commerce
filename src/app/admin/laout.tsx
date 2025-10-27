export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin</h1>
      <nav className="mb-6 flex gap-3 text-sm">
        <a href="/admin" className="rounded border px-2 py-1 hover:bg-accent">Dashboard</a>
        <a href="/admin/homepage" className="rounded border px-2 py-1 hover:bg-accent">Homepage</a>
        <a href="/admin/products" className="rounded border px-2 py-1 hover:bg-accent">Products</a>
      </nav>
      {children}
    </div>
  );
}
