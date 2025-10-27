"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Theme-aware brand logo:
 * - Light mode:  /logo-dark.png
 * - Dark mode:   /logo-white.png
 * - Text fallback if images missing or while mounting
 */
export default function SiteLogo({
  href = "/",
  className = "",
  showTextFallback = true,
}: {
  href?: string;
  className?: string;
  showTextFallback?: boolean;
}) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // While not mounted, avoid hydration issues: show a neutral text fallback
  if (!mounted && showTextFallback) {
    return (
      <Link href={href} className={`font-semibold tracking-tight ${className}`}>
        OnTime Commerce
      </Link>
    );
  }

  const effective = theme === "system" ? systemTheme : theme;
  const src = effective === "dark" ? "/logo-white.png" : "/logo-dark.png";

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <Image
        src={src}
        alt="OnTime Commerce"
        width={140}
        height={36}
        priority
        className="h-9 w-auto"
      />
      {/* Optional text fallback next to the logo for accessibility/SEO */}
      <span className="sr-only">OnTime Commerce</span>
    </Link>
  );
}
