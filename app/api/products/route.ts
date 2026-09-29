import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api/response";
import { createProductSchema, categoryEnum } from "@/lib/validations/schemas";
import { requireAdmin } from "@/lib/auth/admin-session";
import { ApiError } from "@/lib/api/response";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get("category");
  const availableParam = searchParams.get("available");

  const where: any = {};

  if (categoryParam) {
    const parsed = categoryEnum.safeParse(categoryParam);
    if (!parsed.success) {
      throw new ApiError("หมวดหมู่ไม่ถูกต้อง", 400);
    }
    where.category = parsed.data;
  }

  if (availableParam === "true") {
    where.isActive = true;
    where.stock = { gt: 0 };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: "asc" }, { slot: "asc" }],
  });

  return ok(products, 200, { total: products.length });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const body = await req.json();
  const data = createProductSchema.parse(body);

  if (data.stock > data.maxStock) {
    throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, {
      stock: "สต็อกต้องไม่เกินสต็อกสูงสุด",
    });
  }

  const existingSlot = await prisma.product.findUnique({ where: { slot: data.slot } });
  if (existingSlot) {
    throw new ApiError("ข้อมูลไม่ถูกต้อง", 409, { slot: "ช่องนี้ถูกใช้งานแล้ว" });
  }

  const product = await prisma.product.create({ data });
  return ok(product, 201);
});
