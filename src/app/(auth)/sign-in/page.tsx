"use client";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const sp = useSearchParams();
  const to = sp.get("redirect_url") || "/account"; // fall back to account

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        afterSignInUrl={to}         // ✅ honor redirect_url
        appearance={{ variables: { colorPrimary: "hsl(var(--primary))" } }}
      />
    </div>
  );
}
