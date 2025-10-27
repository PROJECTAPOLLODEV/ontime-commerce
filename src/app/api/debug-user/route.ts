import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response(JSON.stringify({ user: null }, null, 2), { headers: { "content-type": "application/json" } });

  const data = {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    publicMetadata: user.publicMetadata,
    // add more if needed
  };
  return new Response(JSON.stringify(data, null, 2), { headers: { "content-type": "application/json" } });
}
