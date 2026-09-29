import { Loader2, PackageOpen, AlertTriangle } from "lucide-react";

export function LoadingState({ label = "กำลังโหลด..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({
  title = "ไม่มีรายการ",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <PackageOpen className="h-10 w-10" />
      <p className="text-lg text-foreground">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({ message = "เกิดข้อผิดพลาด" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-destructive">
      <AlertTriangle className="h-10 w-10" />
      <p>{message}</p>
    </div>
  );
}
