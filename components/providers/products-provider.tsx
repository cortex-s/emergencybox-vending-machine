"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import type { Product } from "@/components/providers/cart-provider";

type ProductsContextValue = {
  products: Product[] | null;
  error: string | null;
  reload: () => void;
};

const ProductsContext = createContext<ProductsContextValue>({
  products: null,
  error: null,
  reload: () => {},
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const pathname = usePathname();

  const reload = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch<Product[]>("/api/products")
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load products");
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, reloadKey]);

  return (
    <ProductsContext.Provider value={{ products, error, reload }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
