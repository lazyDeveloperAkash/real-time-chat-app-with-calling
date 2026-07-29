"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import type { Conversation } from "@/types/models";

export function useConversations() {
  return useQuery({
    queryKey: qk.conversations,
    queryFn: () => unwrap<Conversation[]>(api.get("/chats")),
  });
}
