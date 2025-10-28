"use client";

import { SignedIn, SignedOut, SignOutButton, useUser, UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

interface Order {
  _id: string;
  email: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AccountPage() {
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as any)?.role === "admin";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setLoadingOrders(false);
  };

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

          {/* Order History */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b bg-muted/50 px-6 py-4">
              <h2 className="text-lg font-semibold">Order History</h2>
              <p className="text-sm text-muted-foreground">
                View your past orders and track their status
              </p>
            </div>
            <div className="p-6">
              {loadingOrders ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No orders yet</p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-block text-sm text-primary hover:underline"
                  >
                    Start shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-lg border bg-muted/30 p-4 transition-all hover:bg-muted/50"
                    >
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <div className="text-base font-bold">
                            ${(order.amount / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium line-clamp-1">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ${(item.price / 100).toFixed(2)}
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              ${((item.price * item.quantity) / 100).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.status === "paid" && (
                        <div className="mt-3 flex gap-2 border-t pt-3">
                          <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">
                            View Details
                          </button>
                          <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">
                            Track Order
                          </button>
                          <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">
                            Reorder
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
