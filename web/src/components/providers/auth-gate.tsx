"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";
import { AppLoading } from "@/components/app-loading";

/**
 * Blocks the protected app until the current user is resolved via `GET /me`.
 * On failure (no/expired session that the axios refresh couldn't recover),
 * redirects to /signin. Syncs the resolved user into the auth store.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const setUser = useAuthStore((s) => s.setUser);
  const setReady = useAuthStore((s) => s.setReady);

  useEffect(() => {
    if (data) {
      setUser(data);
      setReady(true);
    }
  }, [data, setUser, setReady]);

  useEffect(() => {
    if (isError) router.replace("/signin");
  }, [isError, router]);

  if (isLoading || isError || !data) return <AppLoading />;

  return <>{children}</>;
}
