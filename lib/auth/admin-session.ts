import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: { id: token, adminId, expiresAt },
  });

  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function destroyAdminSession() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { id: token } });
    cookies().delete(ADMIN_COOKIE);
  }
}

export async function getAdminSession(): Promise<string | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({ where: { id: token } });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.adminId;
}

export async function requireAdminPage(): Promise<string> {
  const adminId = await getAdminSession();
  if (!adminId) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  return adminId as string;
}

export async function requireAdmin(): Promise<string> {
  const adminId = await getAdminSession();
  if (!adminId) {
    const { ApiError } = await import("@/lib/api/response");
    throw new ApiError("ไม่มีสิทธิ์เข้าใช้งาน", 401);
  }
  return adminId;
}
