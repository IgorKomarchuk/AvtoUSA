import "server-only";

import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "./prisma";

export const SESSION_COOKIE = "drivestate_admin";
const sessionDuration = 8 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) return null;
  return new TextEncoder().encode(value);
}

export async function authenticateAdmin(email: string, password: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const developmentMatch = process.env.NODE_ENV !== "production" && process.env.MOCK_AUCTION_MODE !== "false" && email.toLowerCase() === process.env.ADMIN_INITIAL_EMAIL?.toLowerCase() && password === process.env.ADMIN_INITIAL_PASSWORD;
    return developmentMatch ? { id: "mock-admin", email: email.toLowerCase(), name: "Local administrator" } : null;
  }
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user?.isActive || !(await compare(password, user.passwordHash))) return null;
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { id: user.id, email: user.email, name: user.name };
}

export async function createAdminSession(user: { id: string; email: string }) {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET має містити щонайменше 32 символи");
  return new SignJWT({ email: user.email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(key);
}

export async function verifyAdminSession(token?: string | null) {
  const key = secret();
  if (!key || !token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  return verifyAdminSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionDuration,
};
