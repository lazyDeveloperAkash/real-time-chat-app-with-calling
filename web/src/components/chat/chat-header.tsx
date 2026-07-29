"use client";

import Link from "next/link";
import { ArrowLeft, Phone, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./user-avatar";
import { formatPresence } from "@/lib/utils";
import { useChatUiStore } from "@/stores/chat-ui.store";
import { useCall } from "@/hooks/use-call";
import { useCallStore } from "@/stores/call.store";
import type { CallType } from "@/types/socket";

interface Props {
  conversationId: string;
  name: string;
  avatarUrl?: string | null;
  userId?: string; // DM peer id for live presence + calling
  isGroup: boolean;
  typing?: boolean;
  onInfo?: () => void;
}

export function ChatHeader({
  conversationId,
  name,
  avatarUrl,
  userId,
  isGroup,
  typing,
  onInfo,
}: Props) {
  const online = useChatUiStore((s) => (userId ? s.online[userId] : undefined));
  const { startCall } = useCall();
  const inCall = useCallStore((s) => s.status !== "idle");

  const subtitle = typing
    ? "typing…"
    : isGroup
      ? "Group chat"
      : formatPresence(online);

  const start = (type: CallType) =>
    startCall({
      conversationId,
      type,
      peer: !isGroup && userId ? { id: userId, name, avatarUrl: avatarUrl ?? null } : null,
      isGroup,
      groupName: isGroup ? name : undefined,
    });

  return (
    <header className="flex items-center gap-2 border-b p-3">
      <Link href="/chat" className="md:hidden" aria-label="Back">
        <Button variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
      </Link>

      <button
        type="button"
        onClick={onInfo}
        disabled={!onInfo}
        className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
      >
        {isGroup ? (
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <Users className="size-4" />
          </div>
        ) : (
          <UserAvatar name={name} src={avatarUrl} userId={userId} className="size-9" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
        </div>
      </button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Voice call"
        disabled={inCall}
        onClick={() => start("AUDIO")}
      >
        <Phone />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Video call"
        disabled={inCall}
        onClick={() => start("VIDEO")}
      >
        <Video />
      </Button>
    </header>
  );
}
