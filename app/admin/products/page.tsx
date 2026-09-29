import { requireAdminPage } from "@/lib/auth/admin-session";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductManager } from "@/components/admin/product-manager";

export default async function AdminProductsPage() {
  await requireAdminPage();

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">จัดการสินค้า</h1>
        <ProductManager />
      </main>
    </div>
  );
}
