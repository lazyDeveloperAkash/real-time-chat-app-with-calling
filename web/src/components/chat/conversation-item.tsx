"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatConversationTime } from "@/lib/utils";
import { messagePreview } from "@/lib/message-preview";
import { useEncodedId } from "@/hooks/use-id-codec";
import { useAuthStore } from "@/stores/auth.store";
import { useChatUiStore } from "@/stores/chat-ui.store";
import type { Conversation } from "@/types/models";

export function ConversationItem({
  conversation,
  activeToken,
  onNavigate,
}: {
  conversation: Conversation;
  activeToken?: string;
  onNavigate?: () => void;
}) {
  const { chatEntity, isGroup, lastMessage, unreadCount } = conversation;
  const token = useEncodedId(conversation.id);
  const active = !!token && token === activeToken;
  const meId = useAuthStore((s) => s.user?.id);
  const typers = useChatUiStore((s) => s.typing[conversation.id]);
  const isTyping = !!typers && Object.keys(typers).length > 0;

  const name = chatEntity?.name ?? "Unknown";
  const preview = isTyping ? "typing…" : messagePreview(lastMessage, meId);

  return (
    <Link
      href={token ? `/chat/${token}` : "#"}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg p-2 transition-colors",
        active ? "bg-muted" : "hover:bg-muted/60",
      )}
    >
      {isGroup ? (
        <div className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <Users className="size-5" />
        </div>
      ) : (
        <UserAvatar
          name={name}
          src={chatEntity?.avatarUrl}
          userId={chatEntity?.id}
          defaultOnline={chatEntity?.isOnline}
          className="size-11"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          {lastMessage && (
            <span className="text-muted-foreground shrink-0 text-[11px]">
              {formatConversationTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-xs",
              isTyping ? "text-primary" : "text-muted-foreground",
            )}
          >
            {preview}
          </span>
          {unreadCount > 0 && (
            <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
