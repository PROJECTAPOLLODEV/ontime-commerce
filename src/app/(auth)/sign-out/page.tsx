"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const redirect = sp.get("redirect_url") || "/";
    // Sign out and then hard replace to the redirect target
    signOut().finally(() => router.replace(redirect));
  }, [signOut, router, sp]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you out…</p>
    </div>
  );
}
