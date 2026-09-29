"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { emptyCounts, type CashCounts } from "@/lib/utils/cash";

type MachineCashContextValue = {
  cash: CashCounts | null;
  reload: () => void;
};

const MachineCashContext = createContext<MachineCashContextValue>({ cash: null, reload: () => {} });

export function MachineCashProvider({ children }: { children: React.ReactNode }) {
  const [cash, setCash] = useState<CashCounts | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const pathname = usePathname();

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ denomination: number; count: number }[]>("/api/machine/cash")
      .then((rows) => {
        if (cancelled) return;
        const counts = emptyCounts();
        for (const r of rows) counts[r.denomination] = r.count;
        setCash(counts);
      })
      .catch(() => {
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, reloadKey]);

  return <MachineCashContext.Provider value={{ cash, reload }}>{children}</MachineCashContext.Provider>;
}

export function useMachineCash() {
  return useContext(MachineCashContext);
}
