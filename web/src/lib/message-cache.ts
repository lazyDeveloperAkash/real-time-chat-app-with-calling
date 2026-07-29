import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { qk } from "./query-keys";
import type { MessagesPage } from "@/types/api";
import type { Conversation, Message, MessageStatus } from "@/types/models";

type MsgCache = InfiniteData<MessagesPage>;

const STATUS_RANK: Record<MessageStatus, number> = {
  PENDING: 0,
  SENT: 1,
  DELIVERED: 2,
  READ: 3,
};

function editLastPage(old: MsgCache, fn: (msgs: Message[]) => Message[]): MsgCache {
  if (old.pages.length === 0) return old;
  const pages = old.pages.slice();
  const i = pages.length - 1;
  pages[i] = { ...pages[i], messages: fn(pages[i].messages) };
  return { ...old, pages };
}

function mapAll(old: MsgCache, fn: (m: Message) => Message): MsgCache {
  return {
    ...old,
    pages: old.pages.map((p) => ({ ...p, messages: p.messages.map(fn) })),
  };
}

/** Append a message to a conversation's thread cache (no-op if already present). */
export function appendMessage(qc: QueryClient, conversationId: string, message: Message) {
  qc.setQueryData<MsgCache>(qk.messages(conversationId), (old) => {
    if (!old) return old;
    const dup = old.pages.some((p) =>
      p.messages.some(
        (m) => m.id === message.id || (!!message.tempId && m.tempId === message.tempId),
      ),
    );
    if (dup) return old;
    return editLastPage(old, (msgs) => [...msgs, message]);
  });
}

/** Replace an optimistic temp message with the server-confirmed one. */
export function reconcileTemp(
  qc: QueryClient,
  conversationId: string,
  tempId: string,
  server: Message,
) {
  qc.setQueryData<MsgCache>(qk.messages(conversationId), (old) => {
    if (!old) return old;
    return mapAll(old, (m) =>
      m.tempId === tempId ? { ...server, tempId } : m,
    );
  });
}

/** Mark a temp (optimistic) message as failed to send. */
export function markTempFailed(qc: QueryClient, conversationId: string, tempId: string) {
  qc.setQueryData<MsgCache>(qk.messages(conversationId), (old) => {
    if (!old) return old;
    return mapAll(old, (m) => (m.tempId === tempId ? { ...m, failed: true } : m));
  });
}

/** Advance a single message's status (never downgrades). */
export function setMessageStatus(
  qc: QueryClient,
  conversationId: string,
  messageId: string,
  status: MessageStatus,
) {
  qc.setQueryData<MsgCache>(qk.messages(conversationId), (old) => {
    if (!old) return old;
    return mapAll(old, (m) =>
      m.id === messageId && STATUS_RANK[status] > STATUS_RANK[m.status]
        ? { ...m, status }
        : m,
    );
  });
}

/** Advance status of all of my messages in a conversation (e.g. READ receipts). */
export function bumpMyMessagesStatus(
  qc: QueryClient,
  conversationId: string,
  meId: string,
  status: MessageStatus,
) {
  qc.setQueryData<MsgCache>(qk.messages(conversationId), (old) => {
    if (!old) return old;
    return mapAll(old, (m) =>
      m.senderId === meId && STATUS_RANK[status] > STATUS_RANK[m.status]
        ? { ...m, status }
        : m,
    );
  });
}

/**
 * Update the conversation list for an incoming/outgoing message: refresh the
 * last message, reorder to top, and bump unread. Returns false if the
 * conversation isn't in the cache yet (caller should refetch the list).
 */
export function bumpConversation(
  qc: QueryClient,
  message: Message,
  meId: string | undefined,
  activeConversationId: string | null,
): boolean {
  let known = false;
  qc.setQueryData<Conversation[]>(qk.conversations, (old) => {
    if (!old) return old;
    const idx = old.findIndex((c) => c.id === message.conversationId);
    if (idx === -1) return old;
    known = true;
    const conv = old[idx];
    const isMine = message.senderId === meId;
    const isActive = activeConversationId === message.conversationId;
    const updated: Conversation = {
      ...conv,
      lastMessage: {
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        status: message.status,
        senderId: message.senderId,
      },
      unreadCount: isMine || isActive ? conv.unreadCount : conv.unreadCount + 1,
    };
    return [updated, ...old.filter((_, i) => i !== idx)];
  });
  return known;
}

/** Reset unread count for a conversation (on open / read). */
export function clearUnread(qc: QueryClient, conversationId: string) {
  qc.setQueryData<Conversation[]>(qk.conversations, (old) =>
    old?.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
  );
}
