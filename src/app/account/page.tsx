"use client";

import { SignedIn, SignedOut, SignOutButton, useUser, UserProfile } from "@clerk/nextjs";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as any)?.role === "admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SignedOut>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Sign In Required</h2>
            <p className="mb-6 text-muted-foreground">
              Please sign in to view your account details and manage your profile.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/sign-in?redirect_url=/account"
                className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex justify-center rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold">My Account</h1>
              <p className="text-sm text-muted-foreground">
                Manage your profile and account settings
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Account Overview Card */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b bg-muted/50 px-6 py-4">
              <h2 className="text-lg font-semibold">Account Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="mt-1 text-base">
                    {user?.fullName || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <p className="mt-1 text-base">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Type
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isAdmin
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {isAdmin ? "Administrator" : "Customer"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </label>
                  <p className="mt-1 text-base">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3 border-t pt-6">
                <SignOutButton redirectUrl="/">
                  <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>

          {/* Profile Management */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b bg-muted/50 px-6 py-4">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal information and security settings
              </p>
            </div>
            <div className="p-6">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
