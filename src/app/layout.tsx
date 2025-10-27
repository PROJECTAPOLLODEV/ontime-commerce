// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/site/navbar";

export const metadata = {
  title: "OnTime Commerce",
  description: "Industrial signage & materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
