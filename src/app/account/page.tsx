"use client";

import { SignedIn, SignedOut, SignOutButton, useUser, UserProfile } from "@clerk/nextjs";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">My Account</h1>

      <SignedOut>
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">
            You’re not signed in.{" "}
            <Link href="/sign-in?redirect_url=/account" className="underline">Sign in</Link>{" "}
            or <Link href="/sign-up" className="underline">Create an account</Link>.
          </p>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="rounded-md border p-4 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {user?.fullName}</div>
          <div><span className="text-muted-foreground">Email:</span> {user?.primaryEmailAddress?.emailAddress}</div>
          <div><span className="text-muted-foreground">Role:</span> {(user?.publicMetadata as any)?.role ?? "user"}</div>
          <div className="mt-3">
            <SignOutButton redirectUrl="/sign-in">
              <button className="rounded border px-3 py-1 text-sm hover:bg-accent">Sign out</button>
            </SignOutButton>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <UserProfile routing="hash" />
        </div>
      </SignedIn>
    </div>
  );
}
