"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import type { Product } from "@/components/providers/cart-provider";

export function AddStockModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/products/${product.id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      onSaved();
    } catch (err) {
      if (err instanceof ApiClientError && err.fields) {
        setError(Object.values(err.fields)[0]);
      } else {
        setError(err instanceof Error ? err.message : "เติมสต็อกไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>เติมสต็อก - {product.name}</DialogTitle>
          <DialogDescription>
            ปัจจุบัน: {product.stock} / {product.maxStock}
          </DialogDescription>
        </DialogHeader>

        <Input
          type="number"
          placeholder="จำนวนที่เติม"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error ?? undefined}
        />

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังเติม..." : "เติมสต็อก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
