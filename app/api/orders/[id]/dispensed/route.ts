import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api/response";

export const POST = withErrorHandling(
  async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await prisma.$transaction([
      prisma.orderItem.updateMany({
        where: {
          orderId: params.id,
          order: { status: { in: ["PENDING", "DISPENSING"] } },
        },
        data: { dispensed: true },
      }),
      prisma.order.updateMany({
        where: { id: params.id, status: { in: ["PENDING", "DISPENSING"] } },
        data: { status: "COMPLETED" },
      }),
    ]);
    return ok({ completed: true });
  },
);
