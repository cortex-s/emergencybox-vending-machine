"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/utils/format";
import type { Product } from "@/components/providers/cart-provider";

export function ProductCard({
  product,
  onAdd,
  quantityInCart = 0,
  readOnly = false,
}: {
  product: Product;
  onAdd?: (product: Product) => void;
  quantityInCart?: number;
  readOnly?: boolean;
}) {
  const soldOut = product.stock <= 0;
  const maxedOut = quantityInCart >= product.stock;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full bg-background">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 220px"
          className="object-cover"
        />
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm font-bold text-destructive">
            สินค้าหมด
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 font-mono text-xs text-primary">
          {product.slot}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-semibold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatBaht(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">
            {product.stock}/{product.maxStock}
          </span>
        </div>
        {!readOnly && (
          <Button
            size="sm"
            className="mt-2 flex items-center justify-center gap-1"
            disabled={soldOut || maxedOut}
            onClick={() => onAdd?.(product)}
          >
            <Plus className="h-4 w-4" />
            เพิ่ม
          </Button>
        )}
      </div>
    </Card>
  );
}
