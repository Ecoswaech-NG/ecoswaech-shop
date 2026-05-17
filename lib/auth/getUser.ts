import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

/**
 * Use in API route handlers to get the authenticated user.
 *
 * Checks the Authorization header first (for client fetch calls),
 * then falls back to the httpOnly cookie (for server components / SSR).
 *
 * Returns { userId, email } or null if unauthenticated.
 */

export async function getUserFromRequest(req: Request) {
  // 1. Check Authorization header (Bearer token from client fetch)
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // 2. Fall back to httpOnly cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("swaech-token")?.value;
  if (token) return verifyToken(token);

  return null;
}

/**
 * Use in Server Components / page.tsx to get the session.
 * Does not read the Authorization header — cookies only.
 */

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("swaech-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}