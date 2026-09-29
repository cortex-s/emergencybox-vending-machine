"use client";

import { Card } from "@/components/ui/card";
import { useMachineCash } from "@/components/providers/machine-cash-provider";
import { formatBaht } from "@/lib/utils/format";
import { WALLET_DENOMINATIONS, sumCounts, type CashCounts } from "@/lib/utils/cash";

export function MachineCashCard({ cash }: { cash: CashCounts | null }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-baseline gap-3">
        <h2 className="font-semibold">เงินในตู้</h2>
        <span className="text-sm font-medium">{cash ? formatBaht(sumCounts(cash)) : "..."}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {WALLET_DENOMINATIONS.map((d) => {
          const count = cash?.[d] ?? 0;
          return (
            <div key={d} className="flex flex-col items-center rounded-md border p-2 text-center">
              <p className="text-sm font-medium">{formatBaht(d)}</p>
              <p className={count === 0 && cash ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                {cash ? `× ${count}` : "-"}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">ตู้ใช้เงินส่วนนี้ทอนให้ลูกค้า กด "รีเซ็ตเดโม" เพื่อคืนเป็นจำนวนเริ่มต้น</p>
    </Card>
  );
}

export function MachineCashPanel() {
  const { cash } = useMachineCash();
  return <MachineCashCard cash={cash} />;
}
