let tokenCache: { token: string | null; expiresAt: number } = {
  token: null,
  expiresAt: 0,
};

function now() {
  return Math.floor(Date.now() / 1000);
}

function activeEnv(): "production" | "sandbox" {
  return (process.env.CLOVER_ENV === "sandbox" ? "sandbox" : "production");
}

function getApiKey(): string {
  const env = activeEnv();
  const prod = process.env.CLOVER_API_KEY_PROD;
  const sandbox = process.env.CLOVER_API_KEY_SANDBOX;
  const key = env === "production" ? prod : sandbox;
  if (!key) {
    throw new Error(
      `Missing Clover API key for ${env}. ` +
      `Set ${env === "production" ? "CLOVER_API_KEY_PROD" : "CLOVER_API_KEY_SANDBOX"} in .env.local`
    );
  }
  return key;
}

async function postJson<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${url} -> ${res.status} ${res.statusText} ${text?.slice(0, 400)}`);
  }
  return json as T;
}

// Issue a new token with apiKey
async function issueTokenWithApiKey(): Promise<{ token: string; expiresAt: number }> {
  const base = process.env.CLOVER_BASE_URL;
  if (!base) throw new Error("CLOVER_BASE_URL missing");
  const apiKey = getApiKey();

  const data = await postJson<{ accessToken: string; tokenType: string; expiresIn: string | number }>(
    `${base}/token`,
    { apiKey }
  );

  const token = data.accessToken;
  const expiresIn = Number(data.expiresIn ?? 3600);
  if (!token) throw new Error("Token endpoint returned no accessToken");

  // Safety buffer
  return { token, expiresAt: now() + Math.max(60, expiresIn - 60) };
}

// Renew an existing token; if it fails, we re-issue
async function renewToken(oldToken: string): Promise<{ token: string; expiresAt: number }> {
  const base = process.env.CLOVER_BASE_URL!;
  const data = await postJson<{ accessToken: string; tokenType: string; expiresIn: string | number }>(
    `${base}/token-renew`,
    {},
    { Authorization: `Bearer ${oldToken}` }
  );
  const token = data.accessToken;
  const expiresIn = Number(data.expiresIn ?? 3600);
  if (!token) throw new Error("Token-renew returned no accessToken");
  return { token, expiresAt: now() + Math.max(60, expiresIn - 60) };
}

export async function getCloverToken(): Promise<string> {
  // still valid?
  if (tokenCache.token && now() < tokenCache.expiresAt) return tokenCache.token;

  // no token yet → issue
  if (!tokenCache.token) {
    tokenCache = await issueTokenWithApiKey();
    return tokenCache.token!;
  }

  // try renew, else re-issue
  try {
    tokenCache = await renewToken(tokenCache.token!);
    return tokenCache.token!;
  } catch {
    tokenCache = await issueTokenWithApiKey();
    return tokenCache.token!;
  }
}

// Optional helper for debugging (don’t export in prod builds)
export function _cloverActiveEnvForDebug() {
  const env = activeEnv();
  const key = getApiKey();
  return { env, keyPrefix: key.slice(0, 8) + "…" };
}
