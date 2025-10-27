import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const a = auth();
  const data = {
    userId: a.userId,
    orgId: a.orgId,
    sessionId: a.sessionId,
    // what middleware checks:
    role:
      (a.sessionClaims as any)?.publicMetadata?.role ??
      (a.sessionClaims as any)?.metadata?.role ??
      null,
    // dump all claims (redact if you want)
    sessionClaims: a.sessionClaims,
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
