"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/providers/wallet-provider";
import { ProductsProvider, useProducts } from "@/components/providers/products-provider";
import { VendingHeader } from "@/components/vending/header";
import { ProductCard } from "@/components/products/product-card";
import { CashSlot } from "@/components/vending/cash-slot";
import { MachineCashProvider } from "@/components/providers/machine-cash-provider";
import { MachineCashPanel } from "@/components/vending/machine-cash-card";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/states";

function ProductDisplay() {
  const { products, error } = useProducts();
  return (
    <section className="lg:w-[70%] lg:overflow-y-auto">
      <VendingHeader />
      <main className="px-6 py-6">
        {products === null && !error && <LoadingState label="กำลังโหลดตู้กดสินค้า..." />}
        {error && <ErrorState message={error} />}
        {products !== null && products.length === 0 && <EmptyState title="ไม่มีสินค้า" />}
        {products !== null && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} readOnly />
            ))}
          </div>
        )}
      </main>
    </section>
  );
}

export function MachineShell({ children }: { children: React.ReactNode }) {
  const { hydrated, ready } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !ready) router.replace("/start");
  }, [hydrated, ready, router]);

  if (!hydrated || !ready) return null;

  return (
    <ProductsProvider>
      <MachineCashProvider>
      <div className="flex min-h-screen flex-col gap-4 p-4 lg:h-screen">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border lg:min-h-0 lg:flex-row">
          <ProductDisplay />
          <aside className="order-first flex h-[36rem] flex-col border-b border-border bg-muted lg:order-none lg:h-auto lg:w-[30%] lg:border-b-0 lg:border-l">
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </aside>
        </div>
        <div className="grid shrink-0 gap-4 lg:grid-cols-2">
          <CashSlot />
          <MachineCashPanel />
        </div>
      </div>
      </MachineCashProvider>
    </ProductsProvider>
  );
}
