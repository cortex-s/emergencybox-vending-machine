import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api/response";
import { DEFAULT_MACHINE_CASH, WALLET_DENOMINATIONS } from "@/lib/utils/cash";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async () => {
  await prisma.$transaction(
    WALLET_DENOMINATIONS.map((denomination) =>
      prisma.machineCash.upsert({
        where: { denomination },
        update: { count: DEFAULT_MACHINE_CASH[denomination] },
        create: { denomination, count: DEFAULT_MACHINE_CASH[denomination] },
      })
    )
  );
  const rows = await prisma.machineCash.findMany({ orderBy: { denomination: "asc" } });
  return ok(rows);
});
