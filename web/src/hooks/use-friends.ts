"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import type { PublicUser } from "@/types/models";

export function useFriends() {
  return useQuery({
    queryKey: qk.friends,
    queryFn: () => unwrap<PublicUser[]>(api.get("/users/friends")),
  });
}
