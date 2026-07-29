"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import type { PublicUser } from "@/types/models";

export function useSearchUsers(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: qk.search(q),
    queryFn: () => unwrap<PublicUser[]>(api.get("/users/search", { params: { q } })),
    enabled: q.length >= 2,
    staleTime: 30_000,
  });
}
