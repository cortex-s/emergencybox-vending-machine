"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { useWallet } from "@/components/providers/wallet-provider";
import { useMachineCash } from "@/components/providers/machine-cash-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { formatBaht } from "@/lib/utils/format";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { emptyCounts, formatCounts, makeChange, normalizeCounts, sumCounts } from "@/lib/utils/cash";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { inserted, refund, finishPurchase } = useWallet();
  const { cash: machineCash, reload: reloadMachineCash } = useMachineCash();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => refund(), [refund]);

  const cashInserted = sumCounts(inserted);
  const remaining = Math.max(0, total - cashInserted);
  const change = Math.max(0, cashInserted - total);
  const cannotChange = change > 0 && machineCash !== null && makeChange(change, machineCash) === null;
  const canConfirm = cashInserted >= total && items.length > 0 && !submitting && !cannotChange;

  // Machine has no way to pay this change: give the cash back straight away.
  useEffect(() => {
    if (!cannotChange) return;
    refund();
    toast.error(`ตู้ทอนเงิน ${formatBaht(change)} ไม่ได้ ระบบคืนเงินให้แล้ว`, {
      id: "no-change",
    });
  }, [cannotChange, change, refund]);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const order = await apiFetch<{ id: string; changeBreakdown?: Record<string, number> }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          cashBreakdown: inserted,
        }),
      });
      const changeCounts = order.changeBreakdown ? normalizeCounts(order.changeBreakdown) : null;
      finishPurchase(changeCounts ?? emptyCounts());
      if (changeCounts && sumCounts(changeCounts) > 0) {
        toast.success(`ได้รับเงินทอน: ${formatCounts(changeCounts)}`);
      }
      clearCart();
      reloadMachineCash();
      router.push(`/success?orderId=${order.id}`);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409 && err.fields?.cashReceived) {
        refund();
        reloadMachineCash();
        toast.error(err.fields.cashReceived);
      } else if (err instanceof ApiClientError) {
        const firstField = err.fields ? Object.values(err.fields)[0] : undefined;
        toast.error(firstField ?? err.message);
      } else {
        toast.error("ทำรายการไม่สำเร็จ");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <EmptyState title="ตะกร้าว่างเปล่า" description="เลือกสินค้าก่อนชำระเงิน" />
        <Button onClick={() => router.push("/machine")}>กลับ</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <button onClick={() => router.push("/machine")} className="self-start text-sm text-muted-foreground">
        ← กลับ
      </button>
      <h2 className="text-lg font-bold">รายการสั่งซื้อ</h2>

      <div className="flex flex-col gap-1 text-sm">
        {items.map((i) => (
          <div key={i.product.id} className="flex justify-between">
            <span>
              {i.product.name} × {i.quantity}
            </span>
            <span className="text-muted-foreground">{formatBaht(i.product.price * i.quantity)}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t pt-2 text-lg font-bold">
          <span>รวม</span>
          <span>{formatBaht(total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-md bg-muted p-3 font-mono text-sm">
        <div className="flex justify-between">
          <span>เงินที่หยอดแล้ว</span>
          <span>{formatBaht(cashInserted)}</span>
        </div>
        <div className="flex justify-between">
          <span>{remaining > 0 ? "ยังขาดอีก" : "เงินทอน"}</span>
          <span className={remaining > 0 ? "text-destructive" : undefined}>
            {formatBaht(remaining > 0 ? remaining : change)}
          </span>
        </div>
      </div>

      {remaining > 0 && (
        <p className="text-sm text-muted-foreground">หยอดเงินได้ที่ช่อง &quot;เงินของคุณ&quot; ใต้ตู้</p>
      )}
      {cashInserted > 0 && (
        <button onClick={refund} className="self-start text-xs text-muted-foreground underline">
          คืนเงินที่หยอด
        </button>
      )}

      <Button size="lg" disabled={!canConfirm} onClick={handleConfirm}>
        {submitting ? "กำลังดำเนินการ..." : "ยืนยันการซื้อ"}
      </Button>
    </div>
  );
}
