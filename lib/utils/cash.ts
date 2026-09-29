
export const WALLET_DENOMINATIONS = [5, 10, 20, 50, 100] as const;

export type CashCounts = Record<number, number>;

export const DEFAULT_MACHINE_CASH: CashCounts = { 5: 10, 10: 10, 20: 8, 50: 4, 100: 2 };

export function emptyCounts(): CashCounts {
  return Object.fromEntries(WALLET_DENOMINATIONS.map((d) => [d, 0])) as CashCounts;
}

export function sumCounts(counts: CashCounts): number {
  return WALLET_DENOMINATIONS.reduce((s, d) => s + d * (counts[d] ?? 0), 0);
}

export function addCounts(a: CashCounts, b: CashCounts): CashCounts {
  const out = emptyCounts();
  for (const d of WALLET_DENOMINATIONS) out[d] = (a[d] ?? 0) + (b[d] ?? 0);
  return out;
}

export function normalizeCounts(raw: Record<string, number>): CashCounts | null {
  const out = emptyCounts();
  for (const [key, value] of Object.entries(raw)) {
    const d = Number(key);
    if (!(WALLET_DENOMINATIONS as readonly number[]).includes(d)) return null;
    if (!Number.isInteger(value) || value < 0) return null;
    out[d] = value;
  }
  return out;
}

// Tries every combination (greedy fails on cases like ฿60 from ฿50 x1 + ฿20 x3).
export function makeChange(amount: number, available: CashCounts): CashCounts | null {
  const result = emptyCounts();
  if (amount === 0) return result;
  const denoms = [...WALLET_DENOMINATIONS].sort((a, b) => b - a);

  function solve(i: number, remaining: number): boolean {
    if (remaining === 0) return true;
    if (i >= denoms.length) return false;
    const d = denoms[i];
    const maxUse = Math.min(available[d] ?? 0, Math.floor(remaining / d));
    for (let use = maxUse; use >= 0; use--) {
      result[d] = use;
      if (solve(i + 1, remaining - use * d)) return true;
    }
    result[d] = 0;
    return false;
  }

  return solve(0, amount) ? result : null;
}

export function formatCounts(counts: CashCounts): string {
  const parts = [...WALLET_DENOMINATIONS]
    .reverse()
    .filter((d) => (counts[d] ?? 0) > 0)
    .map((d) => `฿${d} × ${counts[d]}`);
  return parts.length ? parts.join(", ") : "-";
}
