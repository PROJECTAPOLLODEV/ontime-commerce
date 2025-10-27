"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const sp = useSearchParams();
  const to = sp.get("redirect_url") || "/account";

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <SignUp
        routing="hash"
        signInUrl="/sign-in"
        afterSignUpUrl={to}         // ✅ honor redirect_url
        appearance={{ variables: { colorPrimary: "hsl(var(--primary))" } }}
      />
    </div>
  );
}
