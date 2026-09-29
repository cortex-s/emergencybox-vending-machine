import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (_req: NextRequest) => {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });
  return ok(orders, 200, { total: orders.length });
});
