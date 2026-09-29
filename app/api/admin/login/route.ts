import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api/response";
import { adminLoginSchema } from "@/lib/validations/schemas";
import { createAdminSession } from "@/lib/auth/admin-session";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { username, password } = adminLoginSchema.parse(body);

  const admin = await prisma.adminAccount.findUnique({ where: { username } });
  if (!admin) {
    throw new ApiError("ข้อมูลไม่ถูกต้อง", 401, {
      username: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new ApiError("ข้อมูลไม่ถูกต้อง", 401, {
      password: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    });
  }

  await createAdminSession(admin.id);
  return ok({ id: admin.id, username: admin.username });
});
