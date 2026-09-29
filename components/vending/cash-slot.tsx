"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { useCart } from "@/components/providers/cart-provider";
import { formatBaht } from "@/lib/utils/format";
import { WALLET_DENOMINATIONS, sumCounts } from "@/lib/utils/cash";
import { ResetDemoButton } from "@/components/vending/reset-demo-button";

export function CashSlot() {
  const { wallet, inserted, total, insert } = useWallet();
  const { total: cartTotal } = useCart();
  const onCheckout = usePathname() === "/checkout";
  const enoughInserted = cartTotal > 0 && sumCounts(inserted) >= cartTotal;
  const canInsert = onCheckout && cartTotal > 0 && !enoughInserted;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-3">
          <h2 className="font-semibold">เงินของคุณ</h2>
          <span className="text-sm font-medium">{formatBaht(total)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/start" className="text-sm text-muted-foreground underline underline-offset-4">
            แก้ไขเงินของฉัน
          </Link>
          <ResetDemoButton />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {WALLET_DENOMINATIONS.map((d) => (
          <div key={d} className="flex flex-col items-center gap-1 rounded-md border p-2 text-center">
            <p className="text-sm font-medium">{formatBaht(d)}</p>
            <p className="text-xs text-muted-foreground">× {wallet[d] ?? 0}</p>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-full"
              disabled={!canInsert || (wallet[d] ?? 0) === 0}
              onClick={() => insert(d)}
            >
              หยอด
            </Button>
          </div>
        ))}
      </div>
      {!onCheckout && <p className="text-xs text-muted-foreground">หยอดเงินได้ที่หน้าชำระเงิน</p>}
      {onCheckout && enoughInserted && (
        <p className="text-xs text-muted-foreground">หยอดเงินครบแล้ว กด "ยืนยันการซื้อ"</p>
      )}
    </Card>
  );
}
