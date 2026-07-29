"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "@/components/providers/auth-gate";
import { SocketProvider } from "@/components/providers/socket-provider";
import { CallProvider } from "@/components/providers/call-provider";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ConnectionBanner } from "@/components/chat/connection-banner";
import { cn } from "@/lib/utils";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // /chat = list view; anything deeper (thread, settings) = detail view.
  const isListView = pathname === "/chat";

  return (
    <AuthGate>
      <SocketProvider>
        <CallProvider>
        <div className="flex h-svh flex-col overflow-hidden">
          <ConnectionBanner />
          <div className="flex min-h-0 flex-1">
            <aside
              className={cn(
                "bg-background w-full shrink-0 md:w-80 md:border-r",
                isListView ? "flex flex-col" : "hidden md:flex md:flex-col",
              )}
            >
              <ChatSidebar />
            </aside>
            <main
              className={cn("min-w-0 flex-1", isListView ? "hidden md:flex" : "flex")}
            >
              {children}
            </main>
          </div>
        </div>
        </CallProvider>
      </SocketProvider>
    </AuthGate>
  );
}
