import Link from "next/link";


async function getCart() {
const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/cart`, { cache: "no-store" });
return res.json();
}


export default async function CartPage() {
const cart = await getCart();
const subtotal = (cart.items ?? []).reduce((s: number, i: any) => s + i.price * i.quantity, 0);
return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">Your Cart</h1>
<div className="space-y-3">
{(cart.items ?? []).map((i: any, idx: number) => (
<div key={idx} className="flex items-center justify-between border-b py-3">
<div className="flex items-center gap-4">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={i.image ?? "/placeholder.png"} alt="" className="h-16 w-16 rounded object-cover" />
<div>
<div>{i.title}</div>
<div className="text-sm text-muted-foreground">Qty {i.quantity}</div>
</div>
</div>
<div className="font-semibold">${(i.price * i.quantity) / 100}</div>
</div>
))}
</div>
<div className="flex items-center justify-between text-lg">
<div>Subtotal</div>
<div className="font-semibold">${subtotal / 100}</div>
</div>
<Link href="/checkout" className="inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Checkout</Link>
</div>
);
}