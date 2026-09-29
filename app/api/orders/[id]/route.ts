import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api/response";

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!order) throw new ApiError("ไม่พบคำสั่งซื้อ", 404);
    return ok(order);
  }
);
