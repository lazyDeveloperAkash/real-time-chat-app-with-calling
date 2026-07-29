/** Centralized TanStack Query keys so cache reads/writes stay consistent. */
export const qk = {
  me: ["me"] as const,
  conversations: ["conversations"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  search: (q: string) => ["search", q] as const,
  friends: ["friends"] as const,
  group: (id: string) => ["group", id] as const,
};
