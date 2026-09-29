"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispensing } from "@/components/vending/dispensing";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { apiFetch } from "@/lib/api/client";

type OrderItem = { productName: string; quantity: number };
type Order = { id: string; items: OrderItem[] };

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("ไม่พบรหัสคำสั่งซื้อ");
      return;
    }
    apiFetch<Order>(`/api/orders/${orderId}`)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "ไม่พบคำสั่งซื้อ"),
      );
  }, [orderId]);

  return (
    <div className="flex h-full items-center justify-center p-4">
      {error && <ErrorState message={error} />}
      {!error && !order && <LoadingState label="กำลังโหลดคำสั่งซื้อ..." />}
      {order && (
        <Dispensing
          items={order.items}
          onDone={() => router.push("/machine")}
          onFinished={() => {
            apiFetch(`/api/orders/${order.id}/dispensed`, {
              method: "POST",
            }).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessContent />
    </Suspense>
  );
}
