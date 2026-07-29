import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorBody, ApiResponse, NormalizedError } from "@/types/api";
import { useAuthStore } from "@/stores/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// ─── Single-flight refresh on 401 ───────────────────────────
let isRefreshing = false;
let waiters: Array<(ok: boolean) => void> = [];
const flushWaiters = (ok: boolean) => {
  waiters.forEach((w) => w(ok));
  waiters = [];
};

const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password"];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";

    // Never try to refresh for auth endpoints (invalid creds / refresh itself).
    const isAuthEndpoint = url.includes("/auth/");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        const ok = await new Promise<boolean>((resolve) => waiters.push(resolve));
        return ok ? api(original) : Promise.reject(error);
      }

      isRefreshing = true;
      try {
        await api.post("/auth/refresh");
        isRefreshing = false;
        flushWaiters(true);
        return api(original);
      } catch (refreshErr) {
        isRefreshing = false;
        flushWaiters(false);
        useAuthStore.getState().clear();
        if (
          typeof window !== "undefined" &&
          !AUTH_ROUTES.some((r) => window.location.pathname.startsWith(r))
        ) {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

/** Unwraps the backend `{ data }` envelope. */
export async function unwrap<T>(p: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const res = await p;
  return res.data.data;
}

/** Normalizes any thrown error to a consistent shape for UI/toasts. */
export function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    return {
      status: err.response?.status ?? 0,
      message: body?.message || err.message || "Something went wrong",
      requestId: body?.requestId,
      fieldErrors: body?.errors,
    };
  }
  return { status: 0, message: (err as Error)?.message || "Something went wrong" };
}
