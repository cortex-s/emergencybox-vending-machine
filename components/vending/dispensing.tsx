"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";

type Item = { productName: string; quantity: number };

export function Dispensing({
  items,
  onDone,
  onFinished,
}: {
  items: Item[];
  onDone: () => void;
  onFinished?: () => void; // เรียกครั้งเดียวตอน animation จบ
}) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (index >= items.length) {
      const t = setTimeout(() => {
        setFinished(true);
        onFinished?.();
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIndex((i) => i + 1), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <PackageCheck className="h-16 w-16 text-primary" />
        <h2 className="text-2xl font-bold">ขอบคุณที่ใช้บริการ!</h2>
        <p className="text-muted-foreground">กรุณารับสินค้าของคุณ</p>
        <button
          onClick={onDone}
          className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          กลับไปหน้าตู้
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="h-6 w-6" />
        <span className="font-semibold">ชำระเงินสำเร็จ</span>
      </div>
      <p className="text-muted-foreground">กำลังเตรียมสินค้า...</p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {items.map((item, i) => {
          const state = i < index ? "done" : i === index ? "active" : "pending";
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-opacity duration-300 ${
                state === "pending" ? "opacity-30" : "opacity-100"
              } ${
                state === "done" ? "border-primary" : "border-border"
              } bg-card`}
            >
              <p className="text-sm text-muted-foreground">
                {item.productName} × {item.quantity}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
                {state === "active" && (
                  <div className="h-full animate-fillbar rounded-full bg-primary" />
                )}
                {state === "done" && (
                  <div className="h-full w-full rounded-full bg-primary" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {state === "done"
                  ? "✓ ปล่อยสินค้าแล้ว"
                  : state === "active"
                    ? "กำลังปล่อยสินค้า..."
                    : "รอคิว..."}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
