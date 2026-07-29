"use client";

import { Check, CheckCheck, Clock, TriangleAlert } from "lucide-react";
import { cn, formatMessageTime } from "@/lib/utils";
import type { Message } from "@/types/models";

function StatusTick({ status }: { status: Message["status"] }) {
  switch (status) {
    case "PENDING":
      return <Clock className="size-3" aria-label="sending" />;
    case "SENT":
      return <Check className="size-3.5" aria-label="sent" />;
    case "DELIVERED":
      return <CheckCheck className="size-3.5" aria-label="delivered" />;
    case "READ":
      return <CheckCheck className="size-3.5 text-sky-400" aria-label="read" />;
  }
}

export function MessageItem({
  message,
  mine,
  showSender,
}: {
  message: Message;
  mine: boolean;
  showSender?: boolean;
}) {
  // System messages (e.g. call events) render as a centered pill.
  if (message.type === "SYSTEM") {
    return (
      <div className="my-1 flex justify-center px-3">
        <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-[11px]">
          {message.content}
        </span>
      </div>
    );
  }

  const isImage = message.type === "IMAGE";

  return (
    <div className={cn("flex px-3", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          mine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm",
        )}
      >
        {showSender && !mine && message.sender && (
          <p className="text-primary mb-0.5 text-xs font-semibold">
            {message.sender.name}
          </p>
        )}

        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.content}
            alt="Shared image"
            className="max-h-72 max-w-full rounded-lg object-cover"
          />
        ) : (
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        )}

        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            mine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {mine &&
            (message.failed ? (
              <TriangleAlert className="text-destructive size-3.5" aria-label="failed" />
            ) : (
              <StatusTick status={message.status} />
            ))}
        </div>
      </div>
    </div>
  );
}
