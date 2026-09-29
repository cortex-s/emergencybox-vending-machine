"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setFieldErrors({});
    try {
      await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      router.push("/admin");
    } catch (err) {
      if (err instanceof ApiClientError && err.fields) setFieldErrors(err.fields);
      else setFieldErrors({ _: err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-1 text-2xl font-bold">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="mb-6 text-sm text-muted-foreground">ระบบจัดการ EmergencyBox</p>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {fieldErrors._ && <p className="text-sm text-destructive">{fieldErrors._}</p>}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
