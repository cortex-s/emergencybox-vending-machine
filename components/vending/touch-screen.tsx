"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useProducts } from "@/components/providers/products-provider";
import { CategoryTabs } from "@/components/products/category-tabs";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/utils/format";

export function TouchScreen() {
  const { products, error, reload } = useProducts();
  const [category, setCategory] = useState("ALL");
  const { items, addItem, incrementItem, decrementItem, total, itemCount } = useCart();
  const router = useRouter();

  const list = (products ?? []).filter((p) => category === "ALL" || p.category === category);
  const quantityFor = (id: string) => items.find((i) => i.product.id === id)?.quantity ?? 0;

  return (
    <div className="flex h-full min-h-[28rem] flex-col gap-3 p-4">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-bold">เลือกสินค้า</h2>
      </div>

      <div className="shrink-0">
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      <ul className="min-h-[10rem] flex-1 overflow-y-auto">
        {products === null && !error && <li className="py-4 text-muted-foreground">กำลังโหลด...</li>}
        {error && (
          <li className="flex items-center justify-between gap-3 py-4 text-destructive">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={reload}>
              ลองใหม่
            </Button>
          </li>
        )}
        {products !== null && list.length === 0 && (
          <li className="py-4 text-muted-foreground">
            {products.length === 0 ? "ไม่มีสินค้า" : "ไม่มีสินค้าในหมวดนี้"}
          </li>
        )}
        {list.map((product) => {
          const qty = quantityFor(product.id);
          return (
            <li
              key={product.id}
              className="flex items-center justify-between border-b border-border py-2"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.slot} · {formatBaht(product.price)}
                </p>
              </div>
              {product.stock <= 0 ? (
                <span className="text-sm text-destructive">สินค้าหมด</span>
              ) : qty === 0 ? (
                <Button size="sm" onClick={() => addItem(product)}>
                  เพิ่ม
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => decrementItem(product.id)}>
                    -
                  </Button>
                  <span className="w-5 text-center">{qty}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={qty >= product.stock}
                    onClick={() => incrementItem(product.id)}
                  >
                    +
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex shrink-0 items-center justify-between text-lg font-bold">
        <span>รวม ({itemCount} ชิ้น)</span>
        <span className="text-primary">{formatBaht(total)}</span>
      </div>
      <Button
        size="lg"
        className="shrink-0"
        disabled={itemCount === 0}
        onClick={() => router.push("/checkout")}
      >
        ถัดไป
      </Button>
    </div>
  );
}
