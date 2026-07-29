"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useDecodedId } from "@/hooks/use-id-codec";
import { useMessages } from "@/hooks/use-messages";
import { useConversations } from "@/hooks/use-conversations";
import { useAuthStore } from "@/stores/auth.store";
import { useChatUiStore } from "@/stores/chat-ui.store";
import { getSocket } from "@/lib/socket";
import { clearUnread } from "@/lib/message-cache";
import { useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { GroupInfoDialog } from "@/components/chat/group-info-dialog";
import { ThreadSkeleton } from "@/components/skeletons/thread-skeleton";
import { Button } from "@/components/ui/button";

export default function ThreadPage() {
  const params = useParams<{ token: string }>();
  const { id: chatId, loading: decoding } = useDecodedId(params.token);
  const qc = useQueryClient();

  const meId = useAuthStore((s) => s.user?.id);
  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === chatId);
  const isGroup = !!conversation?.isGroup;

  const typers = useChatUiStore((s) => (chatId ? s.typing[chatId] : undefined));
  const someoneTyping =
    !!typers && Object.keys(typers).some((id) => id !== meId);
  const setActive = useChatUiStore((s) => s.setActiveConversation);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const query = useMessages(chatId);

  // Mark active + join room + acknowledge read on open.
  useEffect(() => {
    if (!chatId) return;
    setActive(chatId);
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("join-rooms", { roomIds: [chatId] });
      socket.emit("message-read", { conversationId: chatId });
    }
    clearUnread(qc, chatId);
    return () => setActive(null);
  }, [chatId, qc, setActive]);

  if (decoding || !chatId) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <div className="h-14 border-b" />
        <ThreadSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatHeader
        conversationId={chatId}
        name={conversation?.chatEntity?.name ?? "Chat"}
        avatarUrl={conversation?.chatEntity?.avatarUrl}
        userId={!isGroup ? conversation?.chatEntity?.id : undefined}
        isGroup={isGroup}
        typing={someoneTyping}
        onInfo={isGroup ? () => setGroupInfoOpen(true) : undefined}
      />

      {isGroup && (
        <GroupInfoDialog
          groupId={conversation?.chatEntity?.id}
          open={groupInfoOpen}
          onOpenChange={setGroupInfoOpen}
        />
      )}

      {query.isLoading ? (
        <ThreadSkeleton />
      ) : query.isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertCircle className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">Couldn&apos;t load messages.</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <MessageList
          data={query.data}
          meId={meId}
          isGroup={isGroup}
          hasNextPage={!!query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
          someoneTyping={someoneTyping}
        />
      )}

      <MessageInput conversationId={chatId} />
    </div>
  );
}
