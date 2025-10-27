"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // while not mounted, render a neutral button so SSR/CSR match
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm text-muted-foreground"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        •
      </button>
    );
  }

  const effective = theme === "system" ? systemTheme : theme;
  const next = effective === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title="Toggle theme"
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border px-2 py-1 text-sm hover:bg-accent"
    >
      {effective === "dark" ? "🌙" : "🌞"}
      <span className="hidden sm:inline">{next === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
