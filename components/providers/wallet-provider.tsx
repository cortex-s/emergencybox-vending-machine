"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addCounts, emptyCounts, sumCounts, type CashCounts } from "@/lib/utils/cash";

type State = { wallet: CashCounts; inserted: CashCounts; ready: boolean };

type WalletContextValue = State & {
  hydrated: boolean;
  total: number;
  start: () => void;
  setCount: (denomination: number, count: number) => void;
  insert: (denomination: number) => void;
  refund: () => void;
  finishPurchase: (change: CashCounts) => void;
  reset: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);
const STORAGE_KEY = "emergencybox_wallet_v3";

const initialState = (): State => ({
  wallet: emptyCounts(),
  inserted: emptyCounts(),
  ready: false,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState(), ...JSON.parse(raw), ready: false });
    } catch {
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const { ready: _ready, ...persisted } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
    }
  }, [state, hydrated]);

  const startSimulation = useCallback(() => setState((p) => ({ ...p, ready: true })), []);

  const setCount = useCallback((d: number, count: number) => {
    setState((p) => ({ ...p, wallet: { ...p.wallet, [d]: Math.max(0, Math.floor(count) || 0) } }));
  }, []);

  const insert = useCallback((d: number) => {
    setState((p) =>
      (p.wallet[d] ?? 0) <= 0
        ? p
        : {
            ...p,
            wallet: { ...p.wallet, [d]: p.wallet[d] - 1 },
            inserted: { ...p.inserted, [d]: (p.inserted[d] ?? 0) + 1 },
          }
    );
  }, []);

  const refund = useCallback(() => {
    setState((p) => ({ ...p, wallet: addCounts(p.wallet, p.inserted), inserted: emptyCounts() }));
  }, []);

  const finishPurchase = useCallback((change: CashCounts) => {
    setState((p) => ({ ...p, wallet: addCounts(p.wallet, change), inserted: emptyCounts() }));
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  const total = useMemo(() => sumCounts(state.wallet), [state.wallet]);

  return (
    <WalletContext.Provider value={{ ...state, hydrated, total, start: startSimulation, setCount, insert, refund, finishPurchase, reset }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
