"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { sendMessageRest } from "@/lib/chat-api";
import { outboxPut } from "@/lib/idb";
import {
  appendMessage,
  bumpConversation,
  reconcileTemp,
} from "@/lib/message-cache";
import { useAuthStore } from "@/stores/auth.store";
import type { Message, MessageType } from "@/types/models";

const ACK_TIMEOUT_MS = 8000;

/**
 * Optimistic send. Appends a PENDING bubble immediately, then:
 *   1. socket ack (fast path) → SENT,
 *   2. REST fallback if socket down/timed-out → SENT,
 *   3. otherwise enqueue in the encrypted IndexedDB outbox (stays PENDING) to
 *      flush on reconnect.
 */
export function useSendMessage(conversationId?: string) {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  return useCallback(
    async (content: string, type: MessageType = "TEXT") => {
      const text = content.trim();
      if (!text || !conversationId || !me) return;

      const tempId = crypto.randomUUID();
      const optimistic: Message = {
        id: tempId,
        tempId,
        conversationId,
        senderId: me.id,
        content: text,
        type,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        sender: { id: me.id, name: me.name, avatarUrl: me.avatarUrl },
      };

      appendMessage(qc, conversationId, optimistic);
      bumpConversation(qc, optimistic, me.id, conversationId);

      const confirm = (server: Message) =>
        reconcileTemp(qc, conversationId, tempId, server);

      const queueOffline = () =>
        outboxPut({
          id: tempId,
          conversationId,
          message: optimistic,
          createdAt: Date.now(),
        });

      const socket = getSocket();

      if (socket.connected) {
        let settled = false;
        const fallback = () => {
          if (settled) return;
          settled = true;
          sendMessageRest(conversationId, text, type).then(confirm).catch(queueOffline);
        };
        const timer = setTimeout(fallback, ACK_TIMEOUT_MS);

        socket.emit("send-message", { receiverId: conversationId, content: text, type }, (ack) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (ack.success) confirm(ack.message);
          else void queueOffline();
        });
        return;
      }

      // Socket down: try REST directly, else persist to the offline outbox.
      try {
        confirm(await sendMessageRest(conversationId, text, type));
      } catch {
        await queueOffline();
      }
    },
    [conversationId, me, qc],
  );
}
