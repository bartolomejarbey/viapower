import { SignJWT, jwtVerify } from "jose";

// In production a real secret is mandatory; only dev may fall back to a literal.
const rawSecret = process.env.SESSION_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production.");
}
const secret = new TextEncoder().encode(rawSecret || "dev-secret-change-me");

export const SESSION_COOKIE = "vp_session";
export type SessionUser = { id: string; email: string; name?: string };

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ uid: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.uid), email: String(payload.email), name: payload.name ? String(payload.name) : undefined };
  } catch {
    return null;
  }
}
