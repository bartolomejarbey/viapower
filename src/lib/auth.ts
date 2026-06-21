import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken, type SessionUser } from "./auth-core";

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/**
 * Defense-in-depth guard for mutating server actions: throws (rather than
 * redirecting) if there is no session, so the action fails safely regardless
 * of how it was invoked — never relying on the route matcher alone.
 */
export async function assertSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Neautorizováno.");
  return session;
}
