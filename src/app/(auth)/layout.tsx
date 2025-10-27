export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout so Navbar/header from the root layout doesn't render here
  return <div className="min-h-screen flex items-center justify-center p-6">{children}</div>;
}
