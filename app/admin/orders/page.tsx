import { requireAdminPage } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { formatBaht } from "@/lib/utils/format";

export default async function AdminOrdersPage() {
  await requireAdminPage();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">จัดการคำสั่งซื้อ</h1>

        {orders.length === 0 && <EmptyState title="ยังไม่มีคำสั่งซื้อ" />}

        <div className="flex flex-col gap-3">
          {orders.map((order: (typeof orders)[number]) => (
            <Card key={order.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{order.id}</span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  {order.createdAt.toLocaleString("th-TH")}
                </span>
              </div>
              <ul className="mb-3 flex flex-col gap-1 text-sm">
                {order.items.map((item: (typeof order.items)[number]) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">{formatBaht(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm sm:grid-cols-3">
                <Stat label="ยอดรวม" value={formatBaht(order.totalAmount)} accent />
                <Stat label="เงินที่รับ" value={formatBaht(order.cashReceived)} />
                <Stat label="เงินทอน" value={formatBaht(order.changeAmount)} />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={accent ? "font-bold text-primary" : "text-foreground"}>{value}</p>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอปล่อยสินค้า",
  DISPENSING: "กำลังปล่อยสินค้า",
  COMPLETED: "สำเร็จ",
  FAILED: "ล้มเหลว",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-muted-foreground",
  DISPENSING: "text-amber-600",
  COMPLETED: "text-primary",
  FAILED: "text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`font-semibold ${STATUS_COLORS[status] ?? "text-muted-foreground"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
