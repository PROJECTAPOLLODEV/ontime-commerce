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
    <div className="space-y-4">
      <p className="text-muted-foreground">Welcome, {user.firstName}.</p>
      <ul className="list-disc pl-5 text-sm">
        <li><a className="underline" href="/admin/homepage">Edit homepage content</a></li>
        <li><a className="underline" href="/admin/products">Manage products & markup</a></li>
      </ul>
    </div>
  );
}
