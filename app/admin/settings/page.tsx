import { requireAdminPage } from "@/lib/auth/admin-session";
import { AdminNav } from "@/components/admin/admin-nav";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminSettingsPage() {
  await requireAdminPage();

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-md px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">ตั้งค่าบัญชี</h1>
        <ChangePasswordForm />
      </main>
    </div>
  );
}
