"use client";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


export default function CheckoutPage() {
const [items, setItems] = useState<any[]>([]);
useEffect(() => { fetch("/api/cart").then(r => r.json()).then(data => setItems(data.items || [])); }, []);
const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">Checkout</h1>
<div>Total: ${subtotal / 100}</div>
<button
className="rounded bg-primary px-4 py-2 text-primary-foreground"
onClick={async () => {
const res = await fetch("/api/stripe/create-session", { method: "POST", body: JSON.stringify({ items }) });
const { url } = await res.json();
const stripe = await stripePromise; if (url) window.location.href = url;
}}
>
Pay with Stripe
</button>
</div>
);
}