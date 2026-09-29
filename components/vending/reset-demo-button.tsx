"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { useCart } from "@/components/providers/cart-provider";
import { apiFetch } from "@/lib/api/client";

export function ResetDemoButton({ onDone }: { onDone?: () => void }) {
  const { reset } = useWallet();
  const { clearCart } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    setBusy(true);
    let machineReset = true;
    try {
      await apiFetch("/api/machine/reset", { method: "POST" });
    } catch {
      machineReset = false;
    }

    reset();
    clearCart();
    router.push("/start");
    onDone?.();
    setBusy(false);

    if (!machineReset) toast.error("รีเซ็ตกระเป๋าแล้ว แต่รีเซ็ตเงินในตู้ไม่สำเร็จ");
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className="flex items-center justify-center gap-2"
      disabled={busy}
      onClick={handleReset}
    >
      <RotateCcw className="h-4 w-4" />
      {busy ? "กำลังรีเซ็ต..." : "รีเซ็ตเดโม"}
    </Button>
  );
}
