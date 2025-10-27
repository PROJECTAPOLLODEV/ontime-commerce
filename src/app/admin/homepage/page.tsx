"use client";
import { useState, useEffect } from "react";


export default function HomepageEditor() {
const [data, setData] = useState<any>({ title: "Discover amazing variety of products", subtitle: "Custom Solutions. Nationwide Reach. Always On Time.", ctaLabel: "Shop Now", ctaHref: "/shop", image: "" });
useEffect(() => { fetch("/api/admin/banner").then(r => r.json()).then(d => d && setData(d)); }, []);
return (
<div className="space-y-4">
<h1 className="text-2xl font-bold">Homepage Banner</h1>
<div className="grid gap-3 md:max-w-xl">
{Object.keys(data).map(k => (
<label key={k} className="grid gap-1">
<span className="text-sm text-muted-foreground">{k}</span>
<input className="rounded border p-2" value={data[k]} onChange={e => setData({ ...data, [k]: e.target.value })} />
</label>
))}
<button className="rounded bg-primary px-4 py-2 text-primary-foreground" onClick={async () => {
await fetch("/api/admin/banner", { method: "POST", body: JSON.stringify(data) }); alert("Saved");
}}>Save</button>
</div>
</div>
);
}