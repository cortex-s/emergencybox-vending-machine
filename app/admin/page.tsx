import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { formatBaht } from "@/lib/utils/format";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const [productCount, orderCount, revenueAgg, lowStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.product.count({ where: { stock: { lte: 2 } } }),
  ]);

  const stats = [
    { label: "สินค้า", value: productCount },
    { label: "คำสั่งซื้อ", value: orderCount },
    { label: "ยอดขายรวม", value: formatBaht(revenueAgg._sum.totalAmount ?? 0) },
    { label: "สต็อกต่ำ (≤2)", value: lowStockCount },
  ];

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">แดชบอร์ด</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/admin/products" className="text-sm text-primary underline">
            จัดการสินค้า →
          </Link>
          <Link href="/admin/orders" className="text-sm text-primary underline">
            ดูคำสั่งซื้อ →
          </Link>
        </div>
      </main>
    </div>
  );
}
