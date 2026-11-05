import { authClient } from "./auth-client";
import { API_URL } from "./config";
import { notifySuspended } from "./suspension";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }

  get isPremiumRequired() {
    return this.code === "PREMIUM_REQUIRED";
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function api<T = unknown>(
  path: string,
  options: { method?: Method; body?: unknown; query?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const url = new URL(API_URL + path);
  for (const [k, v] of Object.entries(options.query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const cookie = await authClient.getCookie();
  if (cookie) headers.Cookie = cookie;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "omit",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const code = typeof data?.code === "string" ? data.code : undefined;
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : typeof raw === "string" ? raw : `Request failed (${res.status})`;
    if (code === "ACCOUNT_SUSPENDED") notifySuspended(message);
    throw new ApiError(res.status, message, code);
  }
  return data as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
