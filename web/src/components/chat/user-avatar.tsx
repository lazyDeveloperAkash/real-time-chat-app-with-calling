"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import { useChatUiStore } from "@/stores/chat-ui.store";

interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  /** When provided, a live presence dot is shown (subscribed to socket updates). */
  userId?: string;
  defaultOnline?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  src,
  userId,
  defaultOnline,
  className,
}: UserAvatarProps) {
  const storeOnline = useChatUiStore((s) => (userId ? s.online[userId] : undefined));
  const online = storeOnline ?? defaultOnline;

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className="size-full">
        <AvatarImage src={src ?? undefined} alt={name ?? ""} />
        <AvatarFallback className="text-xs font-medium">{initials(name)}</AvatarFallback>
      </Avatar>
      {userId && online && (
        <span
          aria-label="online"
          className="ring-background absolute right-0 bottom-0 size-2.5 rounded-full bg-green-500 ring-2"
        />
      )}
    </div>
  );
}
