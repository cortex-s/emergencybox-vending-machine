import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api/response";
import { updateProductSchema } from "@/lib/validations/schemas";
import { requireAdmin } from "@/lib/auth/admin-session";

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) throw new ApiError("ไม่พบสินค้า", 404);
    return ok(product);
  }
);

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("ไม่พบสินค้า", 404);

    const nextStock = data.stock ?? existing.stock;
    const nextMax = data.maxStock ?? existing.maxStock;
    if (nextStock > nextMax) {
      throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, {
        stock: "สต็อกต้องไม่เกินสต็อกสูงสุด",
      });
    }

    if (data.slot && data.slot !== existing.slot) {
      const slotTaken = await prisma.product.findUnique({ where: { slot: data.slot } });
      if (slotTaken) {
        throw new ApiError("ข้อมูลไม่ถูกต้อง", 409, { slot: "ช่องนี้ถูกใช้งานแล้ว" });
      }
    }

    const product = await prisma.product.update({ where: { id: params.id }, data });
    return ok(product);
  }
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("ไม่พบสินค้า", 404);
    await prisma.product.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  }
);
