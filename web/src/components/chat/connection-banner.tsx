"use client";

import { useChatUiStore } from "@/stores/chat-ui.store";
import { Loader2 } from "lucide-react";

export function ConnectionBanner() {
  const connected = useChatUiStore((s) => s.socketConnected);
  if (connected) return null;
  return (
    <div className="bg-muted text-muted-foreground flex items-center justify-center gap-2 py-1 text-xs">
      <Loader2 className="size-3 animate-spin" />
      Reconnecting…
    </div>
  );
}
