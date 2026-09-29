import { ok, withErrorHandling } from "@/lib/api/response";
import { destroyAdminSession } from "@/lib/auth/admin-session";

export const POST = withErrorHandling(async () => {
  await destroyAdminSession();
  return ok({ success: true });
});
