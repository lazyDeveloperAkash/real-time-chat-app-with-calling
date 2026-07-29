"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import type { MessagesPage } from "@/types/api";

const PAGE_SIZE = 30;

/**
 * Cursor-paginated message history. Page 1 = latest messages; each subsequent
 * "next page" is an older chunk (backend `nextCursor` points further back).
 * `chatId` is always a real conversationId (resolved before navigation).
 */
export function useMessages(chatId?: string) {
  return useInfiniteQuery({
    queryKey: qk.messages(chatId ?? ""),
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`/chats/${chatId}/messages`, {
        params: { cursor: pageParam, limit: PAGE_SIZE },
      });
      return res.data.data as MessagesPage;
    },
    enabled: !!chatId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
