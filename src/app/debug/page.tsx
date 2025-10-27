"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [authDebug, setAuthDebug] = useState<any>(null);
  const [userDebug, setUserDebug] = useState<any>(null);

  useEffect(() => {
    if (isLoaded) {
      fetch("/api/debug-auth")
        .then((r) => r.json())
        .then(setAuthDebug)
        .catch(console.error);

      fetch("/api/debug-user")
        .then((r) => r.json())
        .then(setUserDebug)
        .catch(console.error);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Clerk Authentication Debug</h1>

      <div className="space-y-6">
        {/* Client-side user check */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Client-Side (useUser hook)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Is Signed In:</span>
              <span className={isSignedIn ? "text-green-600" : "text-red-600"}>
                {String(isSignedIn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">User ID:</span>
              <span className="font-mono">{user?.id || "null"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{user?.primaryEmailAddress?.emailAddress || "null"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">publicMetadata:</span>
              <span className="font-mono">
                {JSON.stringify(user?.publicMetadata) || "null"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Role from publicMetadata:</span>
              <span
                className={
                  (user?.publicMetadata as any)?.role === "admin"
                    ? "font-bold text-green-600"
                    : "text-red-600"
                }
              >
                {(user?.publicMetadata as any)?.role || "NOT SET"}
              </span>
            </div>
          </div>
        </div>

        {/* Server-side auth check */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Server-Side Auth (middleware)</h2>
          {authDebug ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">User ID:</span>
                <span className="font-mono">{authDebug.userId || "null"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Session ID:</span>
                <span className="font-mono text-xs">{authDebug.sessionId || "null"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span
                  className={
                    authDebug.role === "admin"
                      ? "font-bold text-green-600"
                      : "text-red-600"
                  }
                >
                  {authDebug.role || "NOT SET"}
                </span>
              </div>
              <div className="mt-4">
                <span className="font-medium">Session Claims:</span>
                <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
                  {JSON.stringify(authDebug.sessionClaims, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>

        {/* Server-side user check */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Server-Side User (currentUser)</h2>
          {userDebug ? (
            <div className="space-y-2 text-sm">
              <pre className="overflow-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(userDebug, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-lg border bg-yellow-50 p-6 dark:bg-yellow-900/20">
          <h2 className="mb-4 text-xl font-semibold">How to Fix</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm">
            <li>
              Go to your{" "}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline"
              >
                Clerk Dashboard
              </a>
            </li>
            <li>Navigate to "Users" in the left sidebar</li>
            <li>Click on your user account</li>
            <li>Scroll down to "Metadata" section</li>
            <li>
              Under <strong>"Public metadata"</strong>, add:
              <pre className="mt-2 rounded bg-black/10 p-2 font-mono text-xs dark:bg-white/10">
                {`{
  "role": "admin"
}`}
              </pre>
            </li>
            <li>Click "Save"</li>
            <li>
              <strong>Important:</strong> Sign out and sign back in for changes to take
              effect
            </li>
            <li>Return to this page and verify "Role" shows "admin" above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
