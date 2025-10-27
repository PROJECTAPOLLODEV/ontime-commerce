// src/lib/clover.ts
// Unified helpers for Clover Imaging API

const BASE = process.env.CLOVER_BASE_URL || "https://www.cloverimaging.com/access-point";

function getActiveApiKey() {
  // We’re running sandbox now; flip to PROD later by .env
  const env = (process.env.CLOVER_ENV || "sandbox").toLowerCase();
  const key = env === "production" ? process.env.CLOVER_API_KEY_PROD : process.env.CLOVER_API_KEY_SANDBOX;
  if (!key) throw new Error(`Missing Clover API key for env=${env}`);
  return { env, key };
}

export async function getCloverToken(): Promise<string> {
  const { key } = getActiveApiKey();
  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ apiKey: key }),
    // Next.js App Router: ensure we don’t cache auth
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clover token failed (${res.status}): ${text}`);
  }
  const json: any = await res.json();
  if (!json?.accessToken) throw new Error("Clover token missing accessToken");
  return json.accessToken as string;
}

// POST helper with Bearer
async function cloverPost<T>(path: string, body: any, token: string): Promise<T> {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${token}`,
      "content-type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clover POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// Products list (already working for you)
export async function cloverGetProductsPage(params: {
  page?: number;
  search?: string;
  productTypes?: string[];
}, token: string) {
  return cloverPost<{
    page: number;
    totalPages: number;
    products: any[];
  }>("/products", {
    page: params.page ?? 1,
    filters: {
      search: params.search ?? undefined,
      productTypes: params.productTypes ?? undefined,
    },
  }, token);
}

// 🔥 Prices – up to 10 item numbers per call
export async function cloverGetPrices(itemNos: string[], token: string) {
  if (!itemNos.length) return { items: [] as any[] };
  const batch = itemNos.slice(0, 10);
  return cloverPost<{ items: Array<{ no: string; availability?: string; serviceLevels?: Array<{ serviceLevelCode: string; no: string; price: string; }> }> }>(
    "/prices",
    { itemNos: batch },
    token
  );
}
