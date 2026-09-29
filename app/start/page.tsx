"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/components/providers/wallet-provider";
import { apiFetch } from "@/lib/api/client";
import { MachineCashCard } from "@/components/vending/machine-cash-card";
import { ResetDemoButton } from "@/components/vending/reset-demo-button";
import { formatBaht } from "@/lib/utils/format";
import { WALLET_DENOMINATIONS, emptyCounts, type CashCounts } from "@/lib/utils/cash";

export default function StartPage() {
  const { wallet, total, setCount, start } = useWallet();
  const router = useRouter();
  const [machineCash, setMachineCash] = useState<CashCounts | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    apiFetch<{ denomination: number; count: number }[]>("/api/machine/cash")
      .then((rows) => {
        const counts = emptyCounts();
        for (const r of rows) counts[r.denomination] = r.count;
        setMachineCash(counts);
      })
      .catch(() => setMachineCash(null));
  }, [reloadKey]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">EmergencyBox</h1>
        <ResetDemoButton onDone={() => setReloadKey((k) => k + 1)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>คุณมีเงินอยู่เท่าไหร่?</CardTitle>
          <CardDescription>
            ใส่จำนวนเหรียญและธนบัตรที่มีในกระเป๋า เพื่อใช้จ่ายที่ตู้
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {WALLET_DENOMINATIONS.map((d) => (
            <div key={d} className="flex items-center justify-between gap-4">
              <Label htmlFor={`denom-${d}`}>
                {d <= 10 ? "เหรียญ" : "ธนบัตร"} {formatBaht(d)}
              </Label>
              <Input
                id={`denom-${d}`}
                type="number"
                min={0}
                value={wallet[d] ?? 0}
                onChange={(e) => setCount(d, Number(e.target.value))}
                className="w-24 text-right"
              />
            </div>
          ))}
          <div className="flex justify-between border-t pt-4 text-sm font-medium">
            <span>รวม</span>
            <span>{formatBaht(total)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={total === 0}
            onClick={() => {
              start();
              router.push("/machine");
            }}
          >
            เริ่มใช้งาน
          </Button>
        </CardFooter>
      </Card>

      <MachineCashCard cash={machineCash} />
    </main>
  );
}
