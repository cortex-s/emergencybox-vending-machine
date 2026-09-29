export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> };
export type ApiFailure = { error: { message: string; fields?: Record<string, string> } };

export class ApiClientError extends Error {
  fields?: Record<string, string>;
  status: number;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const REQUEST_TIMEOUT_MS = 15000;

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError("เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่", 0);
    }
    throw new ApiClientError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", 0);
  } finally {
    clearTimeout(timer);
  }

  const body = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!res.ok || !body || "error" in body) {
    const message = body && "error" in body ? body.error.message : "ดำเนินการไม่สำเร็จ";
    const fields = body && "error" in body ? body.error.fields : undefined;
    throw new ApiClientError(message, res.status, fields);
  }

  return (body as ApiSuccess<T>).data;
}
