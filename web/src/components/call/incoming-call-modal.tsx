"use client";

import { Phone, PhoneOff, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/chat/user-avatar";
import { useCallStore } from "@/stores/call.store";
import { useCall } from "@/hooks/use-call";

export function IncomingCallModal() {
  const { status, peer, callType, isGroup, groupName } = useCallStore();
  const { accept, reject } = useCall();

  if (status !== "incoming") return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card w-full max-w-xs rounded-2xl border p-6 text-center shadow-xl">
        <div className="relative mx-auto w-fit">
          <span className="bg-primary/30 absolute inset-0 animate-ping rounded-full" />
          {isGroup ? (
            <div className="bg-muted text-muted-foreground relative flex size-24 items-center justify-center rounded-full">
              <Users className="size-10" />
            </div>
          ) : (
            <UserAvatar
              name={peer?.name}
              src={peer?.avatarUrl}
              className="relative size-24"
            />
          )}
        </div>

        <p className="mt-4 text-lg font-semibold">
          {isGroup ? (groupName ?? "Group call") : (peer?.name ?? "Unknown")}
        </p>
        <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
          {callType === "VIDEO" ? <Video className="size-4" /> : <Phone className="size-4" />}
          Incoming {callType === "VIDEO" ? "video" : "voice"} call…
        </p>

        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon-lg"
              className="size-14 rounded-full bg-red-600 text-white hover:bg-red-700"
              onClick={reject}
              aria-label="Decline"
            >
              <PhoneOff className="size-6" />
            </Button>
            <span className="text-muted-foreground text-xs">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon-lg"
              className="size-14 rounded-full bg-green-600 text-white hover:bg-green-700"
              onClick={accept}
              aria-label="Accept"
            >
              <Phone className="size-6" />
            </Button>
            <span className="text-muted-foreground text-xs">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
