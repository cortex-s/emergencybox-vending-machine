import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const rows = await prisma.machineCash.findMany({ orderBy: { denomination: "asc" } });
  return ok(rows);
});
