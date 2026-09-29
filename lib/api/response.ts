import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(meta ? { data, meta } : { data }, { status });
}

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json(
    { error: fields ? { message, fields } : { message } },
    { status }
  );
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status = 400, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function withErrorHandling<Ctx = any>(
  handler: (req: NextRequest, ctx: Ctx) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.message, err.status, err.fields);
      }
      if (err instanceof ZodError) {
        const fields: Record<string, string> = {};
        for (const issue of err.issues) {
          fields[issue.path.join(".") || "_"] = issue.message;
        }
        return fail("ข้อมูลไม่ถูกต้อง", 400, fields);
      }
      console.error(err);
      return fail("เกิดข้อผิดพลาดของเซิร์ฟเวอร์", 500);
    }
  };
}
