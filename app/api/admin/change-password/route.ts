import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api/response";
import { adminChangePasswordSchema } from "@/lib/validations/schemas";
import { requireAdmin } from "@/lib/auth/admin-session";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const adminId = await requireAdmin();
  const body = await req.json();
  const { currentPassword, newPassword } = adminChangePasswordSchema.parse(body);

  const admin = await prisma.adminAccount.findUnique({ where: { id: adminId } });
  if (!admin) throw new ApiError("ไม่มีสิทธิ์เข้าใช้งาน", 401);

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, {
      currentPassword: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminAccount.update({ where: { id: adminId }, data: { passwordHash } });

  return ok({ success: true });
});
