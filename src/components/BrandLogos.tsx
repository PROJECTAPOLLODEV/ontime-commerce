"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface BrandLogo {
  lightUrl: string;
  darkUrl: string;
}

interface BrandLogosProps {
  logos: BrandLogo[];
}

export default function BrandLogos({ logos }: BrandLogosProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || logos.length === 0) {
    return null;
  }

  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-xl font-semibold text-muted-foreground">
          Trusted Brands We Carry
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {logos.map((logo, i) => {
            const logoSrc = resolvedTheme === "dark" ? logo.darkUrl : logo.lightUrl;
            // Fallback to the other logo if one is missing
            const fallbackSrc = resolvedTheme === "dark" ? logo.lightUrl : logo.darkUrl;
            const displayLogo = logoSrc || fallbackSrc;

            if (!displayLogo) return null;

            return (
              <div
                key={`${displayLogo}-${i}`}
                className="flex items-center justify-center rounded-lg border bg-background p-4 transition-all hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayLogo}
                  alt={`Brand ${i + 1}`}
                  className="h-12 w-full object-contain grayscale transition-all hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
