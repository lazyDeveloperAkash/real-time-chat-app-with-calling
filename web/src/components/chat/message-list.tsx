"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { InfiniteData } from "@tanstack/react-query";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { formatDayLabel } from "@/lib/utils";
import type { MessagesPage } from "@/types/api";
import type { Message } from "@/types/models";

function DayDivider({ date }: { date: string }) {
  return (
    <div className="my-2 flex justify-center">
      <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-[11px] font-medium">
        {formatDayLabel(date)}
      </span>
    </div>
  );
}

interface Props {
  data?: InfiniteData<MessagesPage>;
  meId?: string;
  isGroup: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  someoneTyping: boolean;
}

export function MessageList({
  data,
  meId,
  isGroup,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  someoneTyping,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingOlderRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const stickBottomRef = useRef(true);

  // pages[0] = newest chunk; reverse so render order is oldest → newest.
  const messages = useMemo<Message[]>(
    () => (data ? [...data.pages].reverse().flatMap((p) => p.messages) : []),
    [data],
  );
  const count = messages.length;
  const lastId = messages[count - 1]?.id;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickBottomRef.current = distanceFromBottom < 120;

    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage && !loadingOlderRef.current) {
      loadingOlderRef.current = true;
      prevScrollHeightRef.current = el.scrollHeight;
      fetchNextPage();
    }
  };

  // Restore scroll on older-chunk prepend; otherwise stick to the bottom.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (loadingOlderRef.current) {
      el.scrollTop = el.scrollTop + (el.scrollHeight - prevScrollHeightRef.current);
      loadingOlderRef.current = false;
    } else if (stickBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [count, lastId, someoneTyping]);

  return (
    <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto py-3">
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        </div>
      )}
      {!hasNextPage && count > 0 && (
        <p className="text-muted-foreground py-2 text-center text-xs">
          Beginning of conversation
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showDay =
            !prev ||
            new Date(prev.createdAt).toDateString() !==
              new Date(m.createdAt).toDateString();
          const mine = m.senderId === meId;
          const showSender = isGroup && !mine && (!prev || prev.senderId !== m.senderId);
          return (
            <div key={m.id}>
              {showDay && <DayDivider date={m.createdAt} />}
              <MessageItem message={m} mine={mine} showSender={showSender} />
            </div>
          );
        })}
        {someoneTyping && <TypingIndicator />}
      </div>
    </div>
  );
}
