"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, PackagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/states";
import { formatBaht, CATEGORY_LABELS } from "@/lib/utils/format";
import { apiFetch } from "@/lib/api/client";
import type { Product } from "@/components/providers/cart-provider";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { AddStockModal } from "@/components/admin/add-stock-modal";

export function ProductManager() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formTarget, setFormTarget] = useState<Product | null | "new">(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await apiFetch<Product[]>("/api/products");
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดสินค้าไม่สำเร็จ");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(product: Product) {
    try {
      await apiFetch(`/api/products/${product.id}`, { method: "DELETE" });
      toast.success("ลบสินค้าแล้ว");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  if (products === null && !error) return <LoadingState label="กำลังโหลดสินค้า..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button className="flex items-center gap-1.5" onClick={() => setFormTarget("new")}>
          <Plus className="h-4 w-4" />
          เพิ่มสินค้า
        </Button>
      </div>

      {products && products.length === 0 && <EmptyState title="ยังไม่มีสินค้า" />}

      {products && products.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="p-3">ช่อง</th>
                <th className="p-3">ชื่อ</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3">ราคา</th>
                <th className="p-3">สต็อก</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-3 font-mono text-primary">{p.slot}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{CATEGORY_LABELS[p.category]}</td>
                  <td className="p-3">{formatBaht(p.price)}</td>
                  <td className="p-3">
                    {p.stock}/{p.maxStock}
                  </td>
                  <td className="p-3">
                    <span className={p.isActive ? "text-primary" : "text-muted-foreground"}>
                      {p.isActive ? "เปิดขาย" : "ซ่อน"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        title="เติมสต็อก"
                        onClick={() => setStockTarget(p)}
                        className="rounded-lg border border-border p-1.5 hover:border-primary"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </button>
                      <button
                        title="แก้ไข"
                        onClick={() => setFormTarget(p)}
                        className="rounded-lg border border-border p-1.5 hover:border-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="ลบ"
                        onClick={() => setDeleteTarget(p)}
                        className="rounded-lg border border-border p-1.5 text-destructive hover:border-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {formTarget !== null && (
        <ProductFormModal
          product={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            toast.success("บันทึกสินค้าแล้ว");
            load();
          }}
        />
      )}

      {stockTarget && (
        <AddStockModal
          product={stockTarget}
          onClose={() => setStockTarget(null)}
          onSaved={() => {
            setStockTarget(null);
            toast.success("อัปเดตสต็อกแล้ว");
            load();
          }}
        />
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบสินค้า</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ {deleteTarget?.name} ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
