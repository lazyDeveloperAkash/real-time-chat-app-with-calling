"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { qk } from "@/lib/query-keys";
import {
  appendMessage,
  bumpConversation,
  bumpMyMessagesStatus,
  setMessageStatus,
} from "@/lib/message-cache";
import { flushOutbox } from "@/lib/outbox-flush";
import { useAuthStore } from "@/stores/auth.store";
import { useChatUiStore } from "@/stores/chat-ui.store";
import { useConversations } from "@/hooks/use-conversations";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const { data: conversations } = useConversations();

  // Connect once for the authenticated session.
  useEffect(() => {
    const socket = connectSocket();
    const ui = useChatUiStore.getState();

    const onConnect = () => {
      ui.setSocketConnected(true);
      const convs = qc.getQueryData(qk.conversations) as
        | { id: string }[]
        | undefined;
      if (convs?.length) socket.emit("join-rooms", { roomIds: convs.map((c) => c.id) });
      // Flush anything queued while offline.
      void flushOutbox(qc, useAuthStore.getState().user?.id);
    };
    const onDisconnect = () => ui.setSocketConnected(false);
    const onOnline = () => void flushOutbox(qc, useAuthStore.getState().user?.id);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (typeof window !== "undefined") window.addEventListener("online", onOnline);

    socket.on("new-message", ({ message }) => {
      const meId = useAuthStore.getState().user?.id;
      const activeId = useChatUiStore.getState().activeConversationId;

      appendMessage(qc, message.conversationId, message);
      const known = bumpConversation(qc, message, meId, activeId);
      if (!known) qc.invalidateQueries({ queryKey: qk.conversations });

      // If we're viewing this conversation, immediately acknowledge read.
      if (activeId === message.conversationId && message.senderId !== meId) {
        socket.emit("message-read", { conversationId: message.conversationId });
      }
    });

    socket.on("message-delivered", ({ messageId }) => {
      const activeId = useChatUiStore.getState().activeConversationId;
      if (activeId) setMessageStatus(qc, activeId, messageId, "DELIVERED");
    });

    socket.on("message-read", ({ conversationId }) => {
      const meId = useAuthStore.getState().user?.id;
      if (meId) bumpMyMessagesStatus(qc, conversationId, meId, "READ");
    });

    socket.on("user-typing", ({ userId, conversationId, isTyping }) => {
      useChatUiStore.getState().setTyping(conversationId, userId, isTyping);
    });

    socket.on("user-online", ({ userId, isOnline }) => {
      useChatUiStore.getState().setOnline(userId, isOnline);
    });

    // Handle the case where the socket connected before listeners attached.
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-message");
      socket.off("message-delivered");
      socket.off("message-read");
      socket.off("user-typing");
      socket.off("user-online");
      if (typeof window !== "undefined") window.removeEventListener("online", onOnline);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep rooms + presence in sync as the conversation list changes.
  useEffect(() => {
    if (!conversations) return;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("join-rooms", { roomIds: conversations.map((c) => c.id) });
    }
    const setOnline = useChatUiStore.getState().setOnline;
    for (const c of conversations) {
      if (!c.isGroup && c.chatEntity?.id) {
        setOnline(c.chatEntity.id, !!c.chatEntity.isOnline);
      }
    }
  }, [conversations]);

  return <>{children}</>;
}
