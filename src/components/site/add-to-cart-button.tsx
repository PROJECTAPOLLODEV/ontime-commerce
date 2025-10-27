"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";


export default function AddToCartButton({ product }: { product: any }) {
const [loading, setLoading] = useState(false);
return (
<Button
disabled={loading}
onClick={async () => {
setLoading(true);
await fetch("/api/cart", { method: "POST", body: JSON.stringify({ productId: product._id, quantity: 1 }) });
setLoading(false);
alert("Added to cart");
}}
>
Add to cart
</Button>
);
}