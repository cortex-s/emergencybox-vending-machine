import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api/response";
import { addStockSchema } from "@/lib/validations/schemas";
import { requireAdmin } from "@/lib/auth/admin-session";

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const { amount } = addStockSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) throw new ApiError("ไม่พบสินค้า", 404);

    const nextStock = product.stock + amount;
    if (nextStock > product.maxStock) {
      throw new ApiError("ข้อมูลไม่ถูกต้อง", 400, {
        amount: `เติม ${amount} ชิ้นแล้วเกินสต็อกสูงสุด (${product.maxStock})`,
      });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { stock: nextStock },
    });

    return ok(updated);
  }
);
