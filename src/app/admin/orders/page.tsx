"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  userId?: string;
  email: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  notes?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

const fulfillmentStatuses = [
  { value: "order_received", label: "Order Received" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "in_transit", label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [editedTracking, setEditedTracking] = useState("");
  const [editedNotes, setEditedNotes] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setEditedStatus(selectedOrder.fulfillmentStatus);
      setEditedTracking(selectedOrder.trackingNumber || "");
      setEditedNotes(selectedOrder.notes || "");
    }
  }, [selectedOrder]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setLoading(false);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentStatus: editedStatus,
          trackingNumber: editedTracking,
          notes: editedNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map((o) => (o._id === updated._id ? updated : o)));
        setSelectedOrder(updated);
        alert("Order updated successfully!");
      } else {
        throw new Error("Failed to update order");
      }
    } catch (err: any) {
      console.error("Error updating order:", err);
      alert(`Failed to update order: ${err.message}`);
    }
    setUpdating(false);
  };

  const getStatusColor = (status: string) => {
    if (status === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (status === "delivered") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (status === "shipped" || status === "in_transit" || status === "out_for_delivery")
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage and fulfill customer orders
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          No orders yet
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">{order.email || "Guest"}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-medium">
                    ${(order.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.fulfillmentStatus)}`}>
                      {order.fulfillmentStatus.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Management Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 border-b bg-background px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Order Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Order ID: {selectedOrder._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-2xl text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Order Details */}
                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 font-semibold">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{selectedOrder.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <span className="capitalize">{selectedOrder.paymentStatus}</span>
                      </div>
                      {selectedOrder.stripePaymentIntentId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stripe ID:</span>
                          <span className="font-mono text-xs">
                            {selectedOrder.stripePaymentIntentId.slice(0, 20)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="rounded-lg border bg-card p-4">
                      <h3 className="mb-3 font-semibold">Shipping Address</h3>
                      <div className="text-sm">
                        <div>{selectedOrder.shippingAddress.name}</div>
                        <div>{selectedOrder.shippingAddress.line1}</div>
                        {selectedOrder.shippingAddress.line2 && (
                          <div>{selectedOrder.shippingAddress.line2}</div>
                        )}
                        <div>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                          {selectedOrder.shippingAddress.postalCode}
                        </div>
                        <div>{selectedOrder.shippingAddress.country}</div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 font-semibold">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 rounded-lg border bg-muted/30 p-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-16 w-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            {item.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ${(item.price / 100).toFixed(2)} = $
                              {((item.price * item.quantity) / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 font-semibold">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${(selectedOrder.subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>
                          {selectedOrder.shipping === 0
                            ? "FREE"
                            : `$${(selectedOrder.shipping / 100).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax:</span>
                        <span>${(selectedOrder.tax / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>Total:</span>
                        <span>${(selectedOrder.amount / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Management */}
                <div className="space-y-4">
                  {/* Fulfillment Status */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 font-semibold">Fulfillment Status</h3>
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {fulfillmentStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Update the order's fulfillment stage
                    </p>
                  </div>

                  {/* Tracking Number */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 font-semibold">Tracking Number</h3>
                    <input
                      type="text"
                      value={editedTracking}
                      onChange={(e) => setEditedTracking(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Add a tracking number for shipment tracking
                    </p>
                  </div>

                  {/* Admin Notes */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 font-semibold">Admin Notes</h3>
                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add internal notes about this order..."
                      rows={4}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Internal notes (not visible to customer)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateOrder}
                      disabled={updating}
                      className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="rounded-md border px-4 py-2 font-medium hover:bg-accent"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
