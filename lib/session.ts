import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Returns the logged-in user's session, or null. Use in API routes to check auth.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
